import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getSafeRedirectPath,
  getSafeAdminRedirectPath,
  toInternalAppHref,
  isInternalAppHref,
} from "../lib/navigation.ts";

describe("getSafeRedirectPath", () => {
  it("allows safe internal paths and preserves query parameters and hashes", () => {
    assert.equal(getSafeRedirectPath("/profile"), "/profile");
    assert.equal(getSafeRedirectPath("/seminar-nasional"), "/seminar-nasional");
    assert.equal(
      getSafeRedirectPath("/profile?tab=security&filter=all#mfa"),
      "/profile?tab=security&filter=all#mfa"
    );
  });

  it("handles array inputs (e.g., duplicate query params) by evaluating the first element", () => {
    assert.equal(getSafeRedirectPath(["/profile", "/login"]), "/profile");
    assert.equal(getSafeRedirectPath(["/.//evil.com", "/profile"]), "/profile");
    assert.equal(getSafeRedirectPath([]), "/profile");
  });

  it("falls back to defaultPath when input is null, undefined, empty, or not starting with slash", () => {
    assert.equal(getSafeRedirectPath(null), "/profile");
    assert.equal(getSafeRedirectPath(undefined), "/profile");
    assert.equal(getSafeRedirectPath(""), "/profile");
    assert.equal(getSafeRedirectPath("profile"), "/profile");
    assert.equal(getSafeRedirectPath("https://evil.com"), "/profile");
    assert.equal(getSafeRedirectPath("javascript:alert(1)"), "/profile");
  });

  it("respects custom defaultPath parameter", () => {
    assert.equal(getSafeRedirectPath(null, "/custom-fallback"), "/custom-fallback");
    assert.equal(getSafeRedirectPath("/.//evil.com", "/custom-fallback"), "/custom-fallback");
  });

  it("rejects auth routes that would cause redirect loops", () => {
    assert.equal(getSafeRedirectPath("/login"), "/profile");
    assert.equal(getSafeRedirectPath("/login/"), "/profile");
    assert.equal(getSafeRedirectPath("/login/mfa-verify"), "/profile");
    assert.equal(getSafeRedirectPath("/register"), "/profile");
    assert.equal(getSafeRedirectPath("/register/"), "/profile");
    assert.equal(getSafeRedirectPath("/auth/callback"), "/profile");
    assert.equal(getSafeRedirectPath("/auth/callback/"), "/profile");
  });

  describe("open redirect prevention via path normalization", () => {
    it("rejects dot-segment inputs that collapse to protocol-relative references", () => {
      assert.equal(getSafeRedirectPath("/.//evil.com"), "/profile");
      assert.equal(getSafeRedirectPath("/..//evil.com"), "/profile");
      assert.equal(getSafeRedirectPath("/test/..//evil.com"), "/profile");
      assert.equal(getSafeRedirectPath("/test/../..//evil.com"), "/profile");
      assert.equal(getSafeRedirectPath("/admin/..//evil.com"), "/profile");
      assert.equal(getSafeRedirectPath("/a/b/../../..//evil.com"), "/profile");
    });

    it("rejects percent-encoded dot bypasses", () => {
      assert.equal(getSafeRedirectPath("/%2e//evil.com"), "/profile");
      assert.equal(getSafeRedirectPath("/%2e%2e//evil.com"), "/profile");
      assert.equal(getSafeRedirectPath("/%2E//evil.com"), "/profile");
      assert.equal(getSafeRedirectPath("/%2E%2E//evil.com"), "/profile");
      assert.equal(getSafeRedirectPath("/.%2e//evil.com"), "/profile");
      assert.equal(getSafeRedirectPath("/%2e.//evil.com"), "/profile");
    });

    it("rejects repeated-slash inputs", () => {
      assert.equal(getSafeRedirectPath("//evil.com"), "/profile");
      assert.equal(getSafeRedirectPath("///evil.com"), "/profile");
      assert.equal(getSafeRedirectPath("////evil.com"), "/profile");
      assert.equal(getSafeRedirectPath("/.///evil.com"), "/profile");
      assert.equal(getSafeRedirectPath("/.////evil.com"), "/profile");
      assert.equal(getSafeRedirectPath("/..///evil.com"), "/profile");
    });

    it("rejects backslash inputs", () => {
      assert.equal(getSafeRedirectPath("/\\evil.com"), "/profile");
      assert.equal(getSafeRedirectPath("/evil.com\\test"), "/profile");
      assert.equal(getSafeRedirectPath("\\\\evil.com"), "/profile");
    });
  });
});

describe("getSafeAdminRedirectPath", () => {
  it("allows paths strictly within /admin subtree", () => {
    assert.equal(getSafeAdminRedirectPath("/admin"), "/admin");
    assert.equal(getSafeAdminRedirectPath("/admin/seminar"), "/admin/seminar");
    assert.equal(
      getSafeAdminRedirectPath("/admin/mechatura?id=123#overview"),
      "/admin/mechatura?id=123#overview"
    );
  });

  it("rejects paths outside /admin subtree", () => {
    assert.equal(getSafeAdminRedirectPath("/profile"), "/admin");
    assert.equal(getSafeAdminRedirectPath("/seminar-nasional"), "/admin");
    assert.equal(getSafeAdminRedirectPath("/admin-fake"), "/admin");
  });

  it("rejects directory traversal and protocol-relative bypasses", () => {
    assert.equal(getSafeAdminRedirectPath("/admin/..//evil.com"), "/admin");
    assert.equal(getSafeAdminRedirectPath("/.//evil.com"), "/admin");
    assert.equal(getSafeAdminRedirectPath("//evil.com"), "/admin");
    assert.equal(getSafeAdminRedirectPath("/admin/../profile"), "/admin");
  });
});

describe("toInternalAppHref", () => {
  it("returns internal relative hrefs unchanged", () => {
    assert.equal(toInternalAppHref("/profile", "https://example.com"), "/profile");
  });

  it("converts same-origin absolute URLs to relative paths", () => {
    assert.equal(
      toInternalAppHref("https://example.com/payment/success?order=1", "https://example.com"),
      "/payment/success?order=1"
    );
  });

  it("returns null for external origin URLs", () => {
    assert.equal(toInternalAppHref("https://evil.com/payment", "https://example.com"), null);
  });

  it("returns null for protocol-relative paths resulting from normalization", () => {
    assert.equal(
      toInternalAppHref("https://example.com/.//evil.com", "https://example.com"),
      null
    );
  });
});

describe("isInternalAppHref", () => {
  it("identifies internal paths correctly", () => {
    assert.equal(isInternalAppHref("/about"), true);
    assert.equal(isInternalAppHref("/"), true);
    assert.equal(isInternalAppHref("//evil.com"), false);
    assert.equal(isInternalAppHref("https://example.com"), false);
    assert.equal(isInternalAppHref("#hash"), false);
    assert.equal(isInternalAppHref(undefined), false);
  });
});
