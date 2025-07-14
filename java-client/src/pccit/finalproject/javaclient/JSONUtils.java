package pccit.finalproject.javaclient;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class JSONUtils {
    public static String toJSON(Object obj) {
        // Simple JSON string creation for basic objects
        if (obj instanceof String) {
            return "\"" + ((String) obj).replace("\"", "\\\"") + "\"";
        }
        return String.valueOf(obj);
    }

    public static <T> T toObject(String json, Class<T> resultClass) throws Exception {
        if (resultClass == UserModel.class) {
            Map<String, String> map = parseJson(json);
            UserModel user = new UserModel();
            user.setId(Integer.parseInt(map.getOrDefault("id", "0")));
            user.setUsername(map.get("username"));
            user.setFname(map.get("fname"));
            user.setLname(map.get("lname"));
            user.setBday(map.get("bday"));
            user.setAdministrator(Boolean.parseBoolean(map.get("administrator")) || "1".equals(map.get("administrator")));
            user.setArticleCount(Integer.parseInt(map.getOrDefault("articleCount", "0")));
            user.setAvatarUrl(map.get("avatarUrl"));
            return resultClass.cast(user);
        }
        throw new Exception("Unsupported class type: " + resultClass.getName());
    }

    public static <T> List<T> toList(String json, Class<T> resultClass) throws Exception {
        List<T> list = new ArrayList<>();
        Pattern pattern = Pattern.compile("\\{([^}]+)\\}");
        Matcher matcher = pattern.matcher(json);

        while (matcher.find()) {
            String objectJson = "{" + matcher.group(1) + "}";
            list.add(toObject(objectJson, resultClass));
        }

        return list;
    }

    private static Map<String, String> parseJson(String json) {
        Map<String, String> map = new HashMap<>();
        Pattern pattern = Pattern.compile("\"(\\w+)\"\\s*:\\s*(\"[^\"]*\"|\\d+|true|false|null)");
        Matcher matcher = pattern.matcher(json);

        while (matcher.find()) {
            String key = matcher.group(1);
            String value = matcher.group(2);
            if (value.startsWith("\"") && value.endsWith("\"")) {
                value = value.substring(1, value.length() - 1);
            }
            map.put(key, value);
        }
        return map;
    }
}