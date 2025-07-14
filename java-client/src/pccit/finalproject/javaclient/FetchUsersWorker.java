package pccit.finalproject.javaclient;

import javax.swing.*;
import java.net.http.HttpResponse;
import java.util.List;

public class FetchUsersWorker extends SwingWorker<List<UserModel>, Void> {
    private final AdminUserList view;

    public FetchUsersWorker(AdminUserList view) {
        this.view = view;
    }

    @Override
    protected List<UserModel> doInBackground() throws Exception {
        HttpResponse<String> response = API.getInstance().getUsers();
        if (response.statusCode() == 200) {
            return JSONUtils.toList(response.body(), UserModel.class);
        } else if (response.statusCode() == 403) {
            throw new Exception("You do not have administrator privileges.");
        }
        throw new Exception("Failed to fetch users: " + response.statusCode());
    }

    @Override
    protected void done() {
        try {
            List<UserModel> users = get();
            view.getUserTableModel().setUsers(users);
        } catch (Exception e) {
            JOptionPane.showMessageDialog(view,
                    "Error fetching users: " + e.getMessage(),
                    "Data Error",
                    JOptionPane.ERROR_MESSAGE);
            if (e.getMessage().contains("privileges")) {
                new LogoutWorker(view).execute();
            }
        }
    }
}
