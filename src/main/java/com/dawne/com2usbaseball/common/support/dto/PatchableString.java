package com.dawne.com2usbaseball.common.support.dto;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

import java.io.IOException;

/**
 * PATCH 요청에서 "필드를 아예 보내지 않음"과 "필드를 보냈지만 비웠음(null/빈 문자열)"을 구분하기 위한 래퍼.
 *
 * - JSON 에 키가 아예 없으면 → 이 필드는 역직렬화되지 않고 자바 기본값 null 그대로 → "손대지 않음"
 * - JSON 에 키가 있고 값이 null 이면 → present=true, value=null → "명시적으로 비움"
 * - JSON 에 키가 있고 문자열이면 → present=true, value=문자열
 *
 * 즉 요청 record 의 필드 타입 자체가 null 인지(키 없음) vs PatchableString 인스턴스인지(키 있음)로
 * "보내지 않음"과 "비움"을 구분한다.
 */
@JsonDeserialize(using = PatchableString.Deserializer.class)
public record PatchableString(boolean present, String value) {

    public static PatchableString of(String value) {
        return new PatchableString(true, value);
    }

    static class Deserializer extends JsonDeserializer<PatchableString> {
        @Override
        public PatchableString deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
            return PatchableString.of(p.getValueAsString());
        }

        @Override
        public PatchableString getNullValue(DeserializationContext ctxt) {
            // JSON 값이 명시적으로 null 인 경우도 "보냈음"으로 취급 (present=true, value=null)
            return PatchableString.of(null);
        }
    }
}
