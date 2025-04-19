// src/utils/guest.ts
import { v4 as uuidv4 } from "uuid";

/**
 * Returns the existing guest ID (from localStorage),
 * or generates + stores a new one if none exists.
 */
export function getOrCreateGuestId(): string {
  let id = localStorage.getItem("guestId");
  if (!id) {
    id = uuidv4();
    localStorage.setItem("guestId", id);
  }
  return id;
}
