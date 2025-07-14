package pccit.finalproject.javaclient;

import javax.swing.table.AbstractTableModel;
import java.util.ArrayList;
import java.util.List;

public class UserTableModel extends AbstractTableModel {
    private List<UserModel> users = new ArrayList<>();
    private final String[] columnNames = {"ID", "Username", "Full Name", "Birthday", "Admin", "Article Count"};

    public void setUsers(List<UserModel> users) {
        this.users = users;
        fireTableDataChanged();
    }

    public UserModel getUserAt(int row) {
        if (row >= 0 && row < users.size()) {
            return users.get(row);
        }
        return null;
    }

    @Override
    public int getRowCount() {
        return users.size();
    }

    @Override
    public int getColumnCount() {
        return columnNames.length;
    }

    @Override
    public String getColumnName(int column) {
        return columnNames[column];
    }

    @Override
    public Object getValueAt(int rowIndex, int columnIndex) {
        UserModel user = users.get(rowIndex);
        switch (columnIndex) {
            case 0: return user.getId();
            case 1: return user.getUsername();
            case 2: return user.getFullName();
            case 3: return user.getBday();
            case 4: return user.isAdministrator() ? "Yes" : "No";
            case 5: return user.getArticleCount();
            default: return null;
        }
    }
}
