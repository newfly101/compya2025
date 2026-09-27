package com.dawne.com2usbaseball.common.support.cache;

import lombok.RequiredArgsConstructor;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.aop.support.AopUtils;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.context.expression.MethodBasedEvaluationContext;
import org.springframework.core.DefaultParameterNameDiscoverer;
import org.springframework.core.ParameterNameDiscoverer;
import org.springframework.expression.EvaluationContext;
import org.springframework.expression.ExpressionParser;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;

@Aspect
@Component
@RequiredArgsConstructor
public class CacheEvictAfterCommitAspect {

    private final CacheManager cacheManager;
    private final ExpressionParser expressionParser = new SpelExpressionParser();
    private final ParameterNameDiscoverer parameterNameDiscoverer = new DefaultParameterNameDiscoverer();

    @AfterReturning("@annotation(annotation)")
    public void evictAfterCommit(JoinPoint joinPoint, CacheEvictAfterCommit annotation) {
        evictAfterCommit(joinPoint, List.of(annotation));
    }

    @AfterReturning("@annotation(annotations)")
    public void evictAfterCommit(JoinPoint joinPoint, CacheEvictsAfterCommit annotations) {
        evictAfterCommit(joinPoint, List.of(annotations.value()));
    }

    private void evictAfterCommit(JoinPoint joinPoint, List<CacheEvictAfterCommit> annotations) {
        // 키 표현식은 메서드 인자가 아직 손에 있는 지금 풀어 둔다. 비우는 시점만 commit 뒤로 미룬다.
        List<Runnable> evictions = resolve(joinPoint, annotations);
        if (evictions.isEmpty()) {
            return;
        }
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    evictions.forEach(Runnable::run);
                }
            });
        } else {
            evictions.forEach(Runnable::run);
        }
    }

    private List<Runnable> resolve(JoinPoint joinPoint, List<CacheEvictAfterCommit> annotations) {
        List<Runnable> evictions = new ArrayList<>();
        for (CacheEvictAfterCommit annotation : annotations) {
            Cache cache = cacheManager.getCache(annotation.cacheName());
            if (cache == null) {
                continue;
            }
            if (annotation.allEntries()) {
                evictions.add(cache::clear);
                continue;
            }
            for (String key : annotation.keys()) {
                evictions.add(() -> cache.evict(key));
            }
            for (String expression : annotation.keyExpressions()) {
                Object key = evaluate(expression, joinPoint);
                evictions.add(() -> cache.evict(key));
            }
        }
        return evictions;
    }

    private Object evaluate(String expression, JoinPoint joinPoint) {
        Method method = AopUtils.getMostSpecificMethod(
                ((MethodSignature) joinPoint.getSignature()).getMethod(), joinPoint.getTarget().getClass());
        EvaluationContext context = new MethodBasedEvaluationContext(
                joinPoint.getTarget(), method, joinPoint.getArgs(), parameterNameDiscoverer);
        return expressionParser.parseExpression(expression).getValue(context);
    }
}
