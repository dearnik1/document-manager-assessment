import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { AppLayout } from "./AppLayout";

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

// Mock AuthContext — default: authenticated user
const mockLogout = vi.fn();
const mockDeleteAccount = vi.fn();
let mockUser: { email: string } | null = { email: "user@example.com" };

vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({
    user: mockUser,
    logout: mockLogout,
    deleteAccount: mockDeleteAccount,
  }),
}));

describe("AppLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = { email: "user@example.com" };
  });

  it("renders application branding", () => {
    render(<AppLayout>content</AppLayout>);

    expect(screen.getByText("Propylon Document Manager")).toBeInTheDocument();
  });

  it("renders children content", () => {
    render(
      <AppLayout>
        <div data-testid="child">Child Content</div>
      </AppLayout>
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("Child Content")).toBeInTheDocument();
  });

  it("shows user email when authenticated", () => {
    render(<AppLayout>content</AppLayout>);

    expect(screen.getByText("user@example.com")).toBeInTheDocument();
  });

  it("does not show user menu when not authenticated", () => {
    mockUser = null;
    render(<AppLayout>content</AppLayout>);

    expect(screen.queryByText("user@example.com")).not.toBeInTheDocument();
  });

  it("opens dropdown menu on email button click", () => {
    render(<AppLayout>content</AppLayout>);

    fireEvent.click(screen.getByText("user@example.com"));

    expect(screen.getByText("Logout")).toBeInTheDocument();
    expect(screen.getByText("Delete Account")).toBeInTheDocument();
  });

  it("calls logout and navigates to /login on logout click", () => {
    render(<AppLayout>content</AppLayout>);

    fireEvent.click(screen.getByText("user@example.com"));
    fireEvent.click(screen.getByText("Logout"));

    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  // ── Delete Account Tests ──────────────────────────────────────────────────

  it("opens confirmation dialog when clicking Delete Account", () => {
    render(<AppLayout>content</AppLayout>);

    // Open menu
    fireEvent.click(screen.getByText("user@example.com"));
    
    // Click Delete Account
    fireEvent.click(screen.getByText("Delete Account"));

    // Verify dialog appears
    expect(screen.getByText("Are you sure? This will permanently delete your account and all your documents. This action cannot be undone.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("closes confirmation dialog when clicking Cancel", async () => {
    render(<AppLayout>content</AppLayout>);

    fireEvent.click(screen.getByText("user@example.com"));
    fireEvent.click(screen.getByText("Delete Account"));

    // Click Cancel
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    // Verify dialog goes away
    await waitFor(() => {
      expect(screen.queryByText("Are you sure? This will permanently delete your account and all your documents. This action cannot be undone.")).not.toBeInTheDocument();
    });
    expect(mockDeleteAccount).not.toHaveBeenCalled();
  });

  it("calls deleteAccount and navigates to /login when confirming deletion", async () => {
    mockDeleteAccount.mockResolvedValueOnce(undefined);
    render(<AppLayout>content</AppLayout>);

    fireEvent.click(screen.getByText("user@example.com"));
    fireEvent.click(screen.getByText("Delete Account"));

    // Click Delete
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(mockDeleteAccount).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });
});
