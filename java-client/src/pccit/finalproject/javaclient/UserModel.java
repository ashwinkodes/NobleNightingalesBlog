package pccit.finalproject.javaclient;

public class UserModel {
    private int id;
    private String username;
    private String fname;
    private String lname;
    private String bday;
    private boolean administrator;
    private int articleCount;
    private String avatarUrl;

    // Required for JSON parsing
    public UserModel() {}

    // Getters and setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getFname() { return fname; }
    public void setFname(String fname) { this.fname = fname; }

    public String getLname() { return lname; }
    public void setLname(String lname) { this.lname = lname; }

    public String getBday() { return bday; }
    public void setBday(String bday) { this.bday = bday; }

    public boolean isAdministrator() { return administrator; }
    public void setAdministrator(boolean administrator) { this.administrator = administrator; }

    public int getArticleCount() { return articleCount; }
    public void setArticleCount(int articleCount) { this.articleCount = articleCount; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public String getFullName() { return fname + " " + lname; }
}