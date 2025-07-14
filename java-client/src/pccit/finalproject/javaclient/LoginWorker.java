package pccit.finalproject.javaclient;

import javax.swing.*;
import java.net.http.HttpResponse;

public class LoginWorker extends SwingWorker<Boolean, Void> {
    private final String username;
    private final String password;
    private final AdminUserList view;

    public LoginWorker(String username, String password, AdminUserList view) {
        this.username = username;
        this.password = password;
        this.view = view;
    }

    @Override
    protected Boolean doInBackground() throws Exception {
        HttpResponse<String> response = API.getInstance().login(username, password);
        return response.statusCode() == 200;
    }

    @Override
    protected void done() {
        try {
            boolean success = get();
            if (success) {
                view.updateButtonStates(true);
                view.clearLoginFields();
                view.refreshUserTable();
            } else {
                JOptionPane.showMessageDialog(view,
                        "Login failed. Please check your credentials.",
                        "Login Error",
                        JOptionPane.ERROR_MESSAGE);
            }
        } catch (Exception e) {
            JOptionPane.showMessageDialog(view,
                    "Error during login: " + e.getMessage(),
                    "Login Error",
                    JOptionPane.ERROR_MESSAGE);
        }
    }
}