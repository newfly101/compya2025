package com.dawne.com2usbaseball.common.support.cache;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/** {@link CacheEvictAfterCommit} 를 여러 번 붙였을 때 컴파일러가 묶어 주는 그릇. 직접 쓰지 않는다. */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface CacheEvictsAfterCommit {
    CacheEvictAfterCommit[] value();
}
