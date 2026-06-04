import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Link,
} from "@mui/material";
import { Visibility, VisibilityOff, Email, Lock } from "@mui/icons-material";

export const LoginPage: React.FC = () => {
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (isSignUp) {
      if (!passwordConfirm) {
        setError("Please confirm your password.");
        return;
      }
      if (password !== passwordConfirm) {
        setError("Passwords do not match.");
        return;
      }
    }

    try {
      setError(null);
      setLoading(true);
      if (isSignUp) {
        await signup(email, password, passwordConfirm);
      } else {
        await login(email, password);
      }
      navigate("/files");
    } catch (err: any) {
      console.error(err);
      const apiError = err.response?.data;
      if (apiError && typeof apiError === "object") {
        const messages = Object.entries(apiError)
          .map(([key, value]) => {
            const label = key === "non_field_errors" ? "" : `${key}: `;
            const valMsg = Array.isArray(value) ? value.join(" ") : String(value);
            return `${label}${valMsg}`;
          })
          .join(" ");
        setError(messages || (isSignUp ? "Sign up failed." : "Invalid email or password."));
      } else {
        setError(isSignUp ? "Sign up failed." : "Invalid email or password.");
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError(null);
    setPasswordConfirm("");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(circle at top right, #1e1b4b 0%, #0b0f19 60%)",
        py: 4,
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        {/* Glow overlay decoration */}
        <Box
          sx={{
            position: "absolute",
            width: "300px",
            height: "300px",
            background: "radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0) 70%)",
            filter: "blur(40px)",
            top: "20%",
            left: "calc(50% - 150px)",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />

        <Card
          sx={{
            position: "relative",
            zIndex: 1,
            borderRadius: 4,
            overflow: "hidden",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
          }}
        >
          {/* Top colored accent bar */}
          <Box
            sx={{
              height: 6,
              background: "linear-gradient(90deg, #6366f1 0%, #ec4899 100%)",
            }}
          />

          <CardContent sx={{ p: { xs: 4, sm: 6 } }}>
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 800,
                  background: "linear-gradient(90deg, #ffffff 0%, #a5b4fc 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Document Manager
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {isSignUp
                  ? "Create an account to start managing your files"
                  : "Sign in to your account to manage files and revisions"}
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: "text.secondary", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ mb: 2 }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: "text.secondary", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ mb: isSignUp ? 2 : 4 }}
              />

              {isSignUp && (
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="passwordConfirm"
                  label="Confirm Password"
                  type={showPassword ? "text" : "password"}
                  id="password-confirm"
                  autoComplete="new-password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  disabled={loading}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: "text.secondary", fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{ mb: 4 }}
                />
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  py: 1.5,
                  fontSize: "1rem",
                  background: "linear-gradient(90deg, #6366f1 0%, #4f46e5 100%)",
                  color: "#ffffff",
                  "&:hover": {
                    background: "linear-gradient(90deg, #818cf8 0%, #6366f1 100%)",
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: "primary.contrastText" }} />
                ) : isSignUp ? (
                  "Sign Up"
                ) : (
                  "Sign In"
                )}
              </Button>

              <Box sx={{ textAlign: "center", mt: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  {isSignUp ? "Already have an account? " : "Don't have an account? "}
                  <Link
                    component="button"
                    type="button"
                    variant="body2"
                    onClick={toggleMode}
                    sx={{
                      color: "#a5b4fc",
                      textDecoration: "none",
                      fontWeight: 600,
                      cursor: "pointer",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    {isSignUp ? "Sign in" : "Sign up"}
                  </Link>
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};
