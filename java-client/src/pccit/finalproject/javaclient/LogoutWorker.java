package pccit.finalproject.javaclient;

import javax.swing.*;
import java.net.http.HttpResponse;
import java.util.ArrayList;

public class LogoutWorker extends SwingWorker<Boolean, Void> {
    private final AdminUserList view;

    public LogoutWorker(AdminUserList view) {
        this.view = view;
    }

    @Override
    protected Boolean doInBackground() throws Exception {
        HttpResponse<String> response = API.getInstance().logout();
        return response.statusCode() == 204;
    }

    @Override
    protected void done() {
        try {
            get();
            view.updateButtonStates(false);
            view.getUserTableModel().setUsers(new ArrayList<>());
            view.clearLoginFields();
        } catch (Exception e) {
            JOptionPane.showMessageDialog(view,
                    "Error during logout: " + e.getMessage(),
                    "Logout Error",
                    JOptionPane.ERROR_MESSAGE);
        }
    }
}