package project.shared_office_starter.util;

import jakarta.annotation.Nullable;

import java.util.Objects;

public class StringBlankUtil {

    public static <D extends Object> String getOrBlankString(@Nullable D object){
        if(Objects.isNull(object)){
            return "";
        }
        return object.toString();
    }
}
