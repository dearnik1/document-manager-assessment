import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppLayout } from "./AppLayout";

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

// Mock AuthContext — default: authenticated user
const mockLogout = vi.fn();
let mockUser: { email: string } | null = { email: "user@example.com" };

vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({
    user: mockUser,
    logout: mockLogout,
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

  it("opens dropdown menu on email button click", async () => {
    const user = userEvent.setup();
    render(<AppLayout>content</AppLayout>);

    await user.click(screen.getByText("user@example.com"));

    expect(screen.getByText("Logout")).toBeInTheDocument();
  });

  it("calls logout and navigates to /login on logout click", async () => {
    const user = userEvent.setup();
    render(<AppLayout>content</AppLayout>);

    await user.click(screen.getByText("user@example.com"));
    await user.click(screen.getByText("Logout"));

    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });
});
