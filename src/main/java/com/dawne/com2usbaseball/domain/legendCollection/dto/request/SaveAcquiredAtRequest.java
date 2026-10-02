package com.dawne.com2usbaseball.domain.legendCollection.dto.request;

import com.fasterxml.jackson.annotation.JsonSetter;

import java.time.LocalDate;

/**
 * 획득일 저장. 필드를 생략하면 그대로 두고, 명시적 null 이면 지운다(그래서 보냈는지를 따로 기억한다).
 * 액자 상태는 frameAcquiredAt 만, 보유중은 둘 다, 미보유는 거절. 오늘(KST) 이후 날짜는 거절.
 */
public class SaveAcquiredAtRequest {
    private boolean frameSet;
    private LocalDate frameAcquiredAt;
    private boolean acquiredSet;
    private LocalDate acquiredAt;

    @JsonSetter("frameAcquiredAt")
    public void setFrameAcquiredAt(LocalDate v) {
        frameSet = true;
        frameAcquiredAt = v;
    }

    @JsonSetter("acquiredAt")
    public void setAcquiredAt(LocalDate v) {
        acquiredSet = true;
        acquiredAt = v;
    }

    public boolean isFrameSet() { return frameSet; }

    public LocalDate getFrameAcquiredAt() { return frameAcquiredAt; }

    public boolean isAcquiredSet() { return acquiredSet; }

    public LocalDate getAcquiredAt() { return acquiredAt; }
}
