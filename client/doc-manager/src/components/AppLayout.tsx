import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { Logout, KeyboardArrowDown, DeleteForever } from "@mui/icons-material";

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, logout, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate("/login");
  };

  const handleDeleteClick = () => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      navigate("/login");
    } catch (err) {
      console.error("Failed to delete account", err);
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: "rgba(11, 15, 25, 0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
        }}
      >
        <Toolbar sx={{ px: { xs: 2, sm: 4, md: 6 } }}>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              background: "linear-gradient(90deg, #ffffff 0%, #a5b4fc 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.01em",
            }}
          >
            Propylon Document Manager
          </Typography>

          {user && (
            <Box>
              <Button
                onClick={handleMenuOpen}
                endIcon={<KeyboardArrowDown />}
                sx={{
                  color: "#9ca3af",
                  textTransform: "none",
                  fontWeight: 500,
                  fontSize: "0.875rem",
                  "&:hover": {
                    color: "#f3f4f6",
                    background: "rgba(255, 255, 255, 0.06)",
                  },
                }}
              >
                {user.email}
              </Button>

              <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={open}
                onClose={handleMenuClose}
                onClick={handleMenuClose}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                slotProps={{
                  paper: {
                    elevation: 0,
                    sx: {
                      overflow: "visible",
                      filter: "drop-shadow(0px 8px 16px rgba(0,0,0,0.4))",
                      mt: 1,
                      background: "rgba(17, 24, 39, 0.95)",
                      backdropFilter: "blur(16px)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: 2,
                      color: "#f3f4f6",
                      width: 180,
                      "& .MuiMenuItem-root": {
                        px: 2,
                        py: 1,
                        fontSize: "0.875rem",
                        transition: "all 0.15s ease",
                        "&:hover": {
                          background: "rgba(255, 255, 255, 0.06)",
                        },
                      },
                    },
                  },
                }}
              >
                <MenuItem
                  onClick={handleLogout}
                  sx={{
                    color: "#d1d5db",
                    "&:hover": {
                      background: "rgba(255, 255, 255, 0.06) !important",
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: "inherit", minWidth: "28px !important" }}>
                    <Logout fontSize="small" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
                <MenuItem
                  onClick={handleDeleteClick}
                  sx={{
                    color: "#ef4444",
                    "&:hover": {
                      background: "rgba(239, 68, 68, 0.08) !important",
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: "inherit", minWidth: "28px !important" }}>
                    <DeleteForever fontSize="small" />
                  </ListItemIcon>
                  Delete Account
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flex: 1 }}>
        {children}
      </Box>

      {/* Delete Account Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        sx={{
          "& .MuiDialog-paper": {
            background: "rgba(17, 24, 39, 0.98)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: 3,
            color: "#f3f4f6",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Account</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "#9ca3af" }}>
            Are you sure? This will permanently delete your account and all your
            documents. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ color: "#9ca3af" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            disabled={deleting}
            variant="contained"
            sx={{
              background: "#dc2626",
              color: "#ffffff",
              "&:hover": { background: "#b91c1c" },
            }}
          >
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
