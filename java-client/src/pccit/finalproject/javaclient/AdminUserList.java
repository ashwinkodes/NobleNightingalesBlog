package pccit.finalproject.javaclient;

import javax.swing.*;
import java.awt.*;
import java.net.http.HttpResponse;

public class AdminUserList extends JFrame {
    private JTable userTable;
    private JButton loginButton;
    private JButton logoutButton;
    private JTextField usernameField;
    private JPasswordField passwordField;
    private UserTableModel tableModel;

    public AdminUserList() {
        setTitle("Admin User List");
        setSize(800, 600);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

        // Main layout
        setLayout(new BorderLayout(10, 10));

        // Create components
        createLoginPanel();
        createTablePanel();

        // Initialize table model
        tableModel = new UserTableModel();
        userTable.setModel(tableModel);

        // Add selection listener to table
        userTable.getSelectionModel().addListSelectionListener(e -> {
            if (!e.getValueIsAdjusting()) {
                int selectedRow = userTable.getSelectedRow();
                if (selectedRow != -1) {
                    UserModel selectedUser = tableModel.getUserAt(selectedRow);
                    showUserDetailsDialog(selectedUser);
                }
            }
        });

        // Set initial button states
        updateButtonStates(false);

        pack();
        setLocationRelativeTo(null);
        setVisible(true);
    }

    private void createLoginPanel() {
        JPanel loginPanel = new JPanel(new FlowLayout(FlowLayout.LEFT, 5, 5));
        loginPanel.setBorder(BorderFactory.createEmptyBorder(5, 5, 5, 5));

        usernameField = new JTextField(15);
        passwordField = new JPasswordField(15);
        loginButton = new JButton("Login");
        logoutButton = new JButton("Logout");

        loginPanel.add(new JLabel("Username:"));
        loginPanel.add(usernameField);
        loginPanel.add(new JLabel("Password:"));
        loginPanel.add(passwordField);
        loginPanel.add(loginButton);
        loginPanel.add(logoutButton);

        loginButton.addActionListener(e -> login());
        logoutButton.addActionListener(e -> logout());

        add(loginPanel, BorderLayout.NORTH);
    }

    private void createTablePanel() {
        userTable = new JTable();
        JScrollPane scrollPane = new JScrollPane(userTable);
        scrollPane.setPreferredSize(new Dimension(700, 400));
        add(scrollPane, BorderLayout.CENTER);
    }

    private void showUserDetailsDialog(UserModel user) {
        JDialog dialog = new JDialog(this, "User Details", true);
        dialog.setLayout(new BorderLayout(10, 10));

        // Create main panel with some padding
        JPanel mainPanel = new JPanel();
        mainPanel.setLayout(new BoxLayout(mainPanel, BoxLayout.Y_AXIS));
        mainPanel.setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));

        // Avatar panel
        JPanel avatarPanel = new JPanel();
        avatarPanel.setLayout(new BoxLayout(avatarPanel, BoxLayout.Y_AXIS));
        JLabel avatarLabel = new JLabel();
        avatarLabel.setAlignmentX(Component.CENTER_ALIGNMENT);

        // Loading indicator
        JLabel loadingLabel = new JLabel("Loading avatar...");
        loadingLabel.setAlignmentX(Component.CENTER_ALIGNMENT);
        avatarPanel.add(loadingLabel);

        // User details
        JPanel detailsPanel = new JPanel(new GridLayout(0, 2, 10, 5));
        detailsPanel.add(new JLabel("Username:"));
        detailsPanel.add(new JLabel(user.getUsername()));
        detailsPanel.add(new JLabel("Full Name:"));
        detailsPanel.add(new JLabel(user.getFullName()));
        detailsPanel.add(new JLabel("Birthday:"));
        detailsPanel.add(new JLabel(user.getBday()));
        detailsPanel.add(new JLabel("Admin:"));
        detailsPanel.add(new JLabel(user.isAdministrator() ? "Yes" : "No"));
        detailsPanel.add(new JLabel("Article Count:"));
        detailsPanel.add(new JLabel(String.valueOf(user.getArticleCount())));

        // Add panels to main panel
        mainPanel.add(avatarPanel);
        mainPanel.add(Box.createRigidArea(new Dimension(0, 20))); // Spacing
        mainPanel.add(detailsPanel);

        // Add main panel to dialog
        dialog.add(mainPanel, BorderLayout.CENTER);

        // Close button
        JButton closeButton = new JButton("Close");
        closeButton.addActionListener(e -> dialog.dispose());
        JPanel buttonPanel = new JPanel(new FlowLayout(FlowLayout.RIGHT));
        buttonPanel.add(closeButton);
        dialog.add(buttonPanel, BorderLayout.SOUTH);

        // Load avatar asynchronously
        new SwingWorker<ImageIcon, Void>() {
            @Override
            protected ImageIcon doInBackground() throws Exception {
                if (user.getAvatarUrl() != null && !user.getAvatarUrl().isEmpty()) {
                    try {
                        HttpResponse<byte[]> response = API.getInstance().getUserAvatar(user.getAvatarUrl());
                        if (response.statusCode() == 200) {
                            return new ImageIcon(response.body());
                        }
                    } catch (Exception e) {
                        System.err.println("Error loading avatar: " + e.getMessage());
                    }
                }
                return null;
            }

            @Override
            protected void done() {
                try {
                    ImageIcon avatar = get();
                    if (avatar != null) {
                        // Scale the image
                        Image scaledImage = avatar.getImage()
                                .getScaledInstance(200, 200, Image.SCALE_SMOOTH);
                        avatarLabel.setIcon(new ImageIcon(scaledImage));
                        avatarPanel.remove(loadingLabel);
                        avatarPanel.add(avatarLabel);
                        avatarPanel.revalidate();
                        avatarPanel.repaint();

                        // Make avatar clickable for larger view
                        avatarLabel.setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));
                        avatarLabel.addMouseListener(new java.awt.event.MouseAdapter() {
                            public void mouseClicked(java.awt.event.MouseEvent evt) {
                                showLargeAvatar(avatar);
                            }
                        });
                    } else {
                        loadingLabel.setText("No avatar available");
                    }
                } catch (Exception e) {
                    loadingLabel.setText("Failed to load avatar");
                    System.err.println("Error setting avatar: " + e.getMessage());
                }
            }
        }.execute();

        // Set dialog size and location
        dialog.setSize(400, 500);
        dialog.setLocationRelativeTo(this);
        dialog.setVisible(true);
    }

    private void showLargeAvatar(ImageIcon originalIcon) {
        JDialog dialog = new JDialog(this, "User Avatar", true);
        JLabel largeAvatarLabel = new JLabel();

        // Scale the image to a larger size while maintaining aspect ratio
        Image originalImage = originalIcon.getImage();
        int originalWidth = originalImage.getWidth(null);
        int originalHeight = originalImage.getHeight(null);

        // Calculate new dimensions (max 400x400)
        int maxDimension = 400;
        double scale = Math.min((double) maxDimension / originalWidth,
                (double) maxDimension / originalHeight);
        int scaledWidth = (int) (originalWidth * scale);
        int scaledHeight = (int) (originalHeight * scale);

        Image scaledImage = originalImage.getScaledInstance(
                scaledWidth, scaledHeight, Image.SCALE_SMOOTH);
        largeAvatarLabel.setIcon(new ImageIcon(scaledImage));

        dialog.add(largeAvatarLabel);
        dialog.pack();
        dialog.setLocationRelativeTo(this);
        dialog.setVisible(true);
    }

    private void login() {
        String username = usernameField.getText();
        String password = new String(passwordField.getPassword());

        if (username.isEmpty() || password.isEmpty()) {
            JOptionPane.showMessageDialog(this,
                    "Please enter both username and password",
                    "Login Error",
                    JOptionPane.ERROR_MESSAGE);
            return;
        }

        new LoginWorker(username, password, this).execute();
    }

    private void logout() {
        new LogoutWorker(this).execute();
    }

    public void updateButtonStates(boolean loggedIn) {
        loginButton.setEnabled(!loggedIn);
        logoutButton.setEnabled(loggedIn);
        usernameField.setEnabled(!loggedIn);
        passwordField.setEnabled(!loggedIn);
        userTable.setEnabled(loggedIn);
    }

    public void clearLoginFields() {
        usernameField.setText("");
        passwordField.setText("");
    }

    public UserTableModel getUserTableModel() {
        return tableModel;
    }

    public void refreshUserTable() {
        new FetchUsersWorker(this).execute();
    }
}