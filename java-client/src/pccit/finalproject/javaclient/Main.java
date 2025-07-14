package pccit.finalproject.javaclient;

import javax.swing.SwingUtilities;

public class Main {
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new AdminUserList());
    }
}