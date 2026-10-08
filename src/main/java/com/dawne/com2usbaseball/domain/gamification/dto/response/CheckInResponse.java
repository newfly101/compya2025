package com.dawne.com2usbaseball.domain.gamification.dto.response;

/** 이번 호출로 새로 받은 양. 오늘 이미 받았으면 0/0, leveledUp=false. level 은 호출 후 현재 등급. */
public record CheckInResponse(int xp, int point, int level, String levelName, boolean leveledUp) {
}
