package com.dawne.com2usbaseball.config;

import com.dawne.com2usbaseball.common.support.dto.GlobalResponse;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.core.annotation.AnnotationUtils;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Aspect
@Component
@Order(1)
@Slf4j
public class LoggingAspect {

    private static final long SLOW_CALL_THRESHOLD_MS = 1000L;
    private static final int ARG_MAX_LENGTH = 200;
    private static final int PREVIEW_MAX_LENGTH = 300;
    private static final String MASK = "***";

    private static final Set<String> SENSITIVE_PARAM_KEYWORDS = Set.of(
            "password", "pwd", "secret", "token", "authorization", "cookie", "jwt", "credential", "apikey"
    );

    private static final Set<String> SENSITIVE_METHOD_KEYWORDS = Set.of(
            "login", "logout", "auth", "oauth", "naver", "callback", "register", "signup"
    );

    @Pointcut(
            "within(@org.springframework.stereotype.Controller *)"
                    + " || within(@org.springframework.web.bind.annotation.RestController *)"
    )
    public void controllerLayer() {}

    @Pointcut("within(@org.springframework.stereotype.Service *)")
    public void serviceLayer() {}

    @Pointcut("within(org.springdoc..*)")
    public void swaggerBean() {}

    @Around("(controllerLayer() || serviceLayer()) && !swaggerBean()")
    public Object logAround(ProceedingJoinPoint point) throws Throwable {
        Class<?> declaringType = point.getSignature().getDeclaringType();
        String className = declaringType.getSimpleName();
        String methodName = point.getSignature().getName();
        boolean isController = isController(declaringType);
        boolean sensitiveMethod = isSensitiveMethodName(methodName);

        logEnter(isController, className, methodName, point, sensitiveMethod);

        long start = System.currentTimeMillis();
        try {
            Object result = point.proceed();
            long elapsed = System.currentTimeMillis() - start;
            logExit(isController, className, methodName, elapsed, point, result, sensitiveMethod);
            return result;
        } catch (Throwable t) {
            long elapsed = System.currentTimeMillis() - start;
            log.error("(ERROR) [{}] {} {}ms args={} cause={}: {}",
                    className, methodName, elapsed,
                    formatArgs(point, sensitiveMethod),
                    t.getClass().getSimpleName(), t.getMessage());
            throw t;
        }
    }

    private void logEnter(boolean isController, String className, String methodName,
                          ProceedingJoinPoint point, boolean sensitiveMethod) {
        if (isController) {
            log.info("(START) [{}] {} args={}", className, methodName, formatArgs(point, sensitiveMethod));
        } else if (log.isDebugEnabled()) {
            log.debug("(START) [{}] {} args={}", className, methodName, formatArgs(point, sensitiveMethod));
        }
    }

    private void logExit(boolean isController, String className, String methodName,
                         long elapsed, ProceedingJoinPoint point, Object result,
                         boolean sensitiveMethod) {
        boolean slow = elapsed > SLOW_CALL_THRESHOLD_MS;
        if (!slow && !isController && !log.isDebugEnabled()) return;

        // 인증 계열은 응답에 토큰·개인정보가 실릴 수 있어 값을 남기지 않는다.
        String ret = sensitiveMethod ? MASK : summarizeReturn(point, result);

        if (slow) {
            log.warn("(SLOW) [{}] {} {}ms (threshold {}ms) return={}",
                    className, methodName, elapsed, SLOW_CALL_THRESHOLD_MS, ret);
        } else if (isController) {
            log.info("(EXIT) [{}] {} {}ms return={}", className, methodName, elapsed, ret);
        } else {
            log.debug("(EXIT) [{}] {} {}ms return={}", className, methodName, elapsed, ret);
        }
    }

    private boolean isController(Class<?> type) {
        return AnnotationUtils.findAnnotation(type, RestController.class) != null
                || AnnotationUtils.findAnnotation(type, Controller.class) != null;
    }

    private String formatArgs(ProceedingJoinPoint point, boolean sensitiveMethod) {
        Object[] args = point.getArgs();
        if (args.length == 0) return "[]";

        String[] names = ((MethodSignature) point.getSignature()).getParameterNames();
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < args.length; i++) {
            if (i > 0) sb.append(", ");
            String name = (names != null && i < names.length) ? names[i] : ("arg" + i);
            sb.append(name).append("=");
            if (sensitiveMethod || isSensitiveParamName(name)) {
                sb.append(MASK);
            } else {
                sb.append(safeFormat(args[i]));
            }
        }
        sb.append("]");
        return sb.toString();
    }

    private String summarizeReturn(ProceedingJoinPoint point, Object result) {
        if (result == null) {
            MethodSignature sig = (MethodSignature) point.getSignature();
            return sig.getReturnType().equals(Void.TYPE) ? "void" : "null";
        }
        return safeFormat(result);
    }

    /** 재귀 없이 한 줄로 줄인다. 목록 첫 항목 미리보기에만 쓴다. */
    private String brief(Object value) {
        if (value == null) return "null";
        try {
            String v = String.valueOf(value);
            return v.length() > PREVIEW_MAX_LENGTH
                    ? v.substring(0, PREVIEW_MAX_LENGTH) + "...(len=" + v.length() + ")"
                    : v;
        } catch (Throwable t) {
            return value.getClass().getSimpleName() + "(toString-failed)";
        }
    }

    private String safeFormat(Object value) {
        if (value == null) return "null";
        String summary = summarizeValue(value);
        if (summary != null) return summary;
        try {
            String s = String.valueOf(value);
            if (s.length() > ARG_MAX_LENGTH) {
                return s.substring(0, ARG_MAX_LENGTH) + "...(len=" + s.length() + ")";
            }
            return s;
        } catch (Throwable t) {
            return value.getClass().getSimpleName() + "(toString-failed)";
        }
    }

    private String summarizeValue(Object value) {
        String type = value.getClass().getSimpleName();
        if (value instanceof GlobalResponse<?> gr) {
            return "GlobalResponse(success=" + gr.success()
                    + ", code=" + (gr.code() == null ? "null" : gr.code().name())
                    + ", data=" + (gr.data() == null ? "null" : safeFormat(gr.data())) + ")";
        }
        // 목록은 INFO 에서 크기만 남긴다. 레전드 목록이 118KB 라 통째로 찍으면 로그를 못 쓴다.
        // 내용까지 봐야 하면 logging.level.com.dawne.com2usbaseball=DEBUG 로 내린다.
        if (value instanceof List<?> l) {
            if (l.isEmpty() || !log.isDebugEnabled()) return "List(size=" + l.size() + ")";
            return "List(size=" + l.size() + ", first=" + brief(l.get(0)) + ")";
        }
        if (value instanceof Collection<?> c) return "Collection(size=" + c.size() + ")";
        if (value instanceof Map<?, ?> m) return "Map(size=" + m.size() + ")";
        if (value instanceof MultipartFile mf) {
            return "MultipartFile(name=" + mf.getOriginalFilename() + ", size=" + mf.getSize() + ")";
        }
        if (value instanceof ServletRequest || value instanceof ServletResponse) {
            return type;
        }
        return null;
    }

    private boolean isSensitiveMethodName(String methodName) {
        String lower = methodName.toLowerCase();
        for (String kw : SENSITIVE_METHOD_KEYWORDS) {
            if (lower.contains(kw)) return true;
        }
        return false;
    }

    private boolean isSensitiveParamName(String name) {
        if (name == null) return false;
        String lower = name.toLowerCase();
        for (String kw : SENSITIVE_PARAM_KEYWORDS) {
            if (lower.contains(kw)) return true;
        }
        return false;
    }
}
