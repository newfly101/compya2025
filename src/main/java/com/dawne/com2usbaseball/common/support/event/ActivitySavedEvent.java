package com.dawne.com2usbaseball.common.support.event;

/** 이용자가 저장 동작(컬렉션 변경·레전드 스킬)을 마쳤다는 알림. 보상 도메인이 커밋 후 받는다. */
public record ActivitySavedEvent(Long userId) {
}
