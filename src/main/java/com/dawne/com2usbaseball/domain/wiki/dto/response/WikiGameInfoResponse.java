package com.dawne.com2usbaseball.domain.wiki.dto.response;

import com.dawne.com2usbaseball.domain.wiki.enums.WikiTarget;

import java.util.List;

public record WikiGameInfoResponse(
        WikiTarget target,
        List<WikiPitchResponse> pitches,
        List<WikiStatInfluenceResponse> statInfluences
) {
}
