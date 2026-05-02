"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ContactEntry } from "@/lib/mecanipana-types";
import { appendContact, loadContacts } from "@/lib/local-storage-data";
import { pushContactEntryRemote } from "@/lib/remote/sync-log-entries-remote";

function contactOptionLabel(c: ContactEntry): string {
  const a = c.name.trim();
  const b = c.phone.trim();
  if (a && b) return `${a} · ${b}`;
  return a || b || "Sin nombre";
}

export type ContactPickerFieldProps = {
  idPrefix: string;
  value: string | null;
  onChange: (contactId: string | null) => void;
};

export function ContactPickerField({
  idPrefix,
  value,
  onChange,
}: ContactPickerFieldProps) {
  const [contacts, setContacts] = useState<ContactEntry[]>(() => loadContacts());
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [portalReady, setPortalReady] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const baseId = useId();

  const refreshContacts = useCallback(() => setContacts(loadContacts()), []);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  function openAddModal() {
    setName("");
    setPhone("");
    setLocation("");
    dialogRef.current?.showModal();
  }

  function closeModal() {
    dialogRef.current?.close();
  }

  function submitContact(e: React.FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    const n = name.trim();
    if (!n) return;
    const row = appendContact({
      name: n,
      phone: phone.trim().slice(0, 64),
      location: location.trim().slice(0, 500),
    });
    void pushContactEntryRemote(row);
    refreshContacts();
    onChange(row.id);
    // Avoid <dialog> click-through onto the page submit button.
    window.setTimeout(() => {
      dialogRef.current?.close();
    }, 0);
  }

  const selectId = `${idPrefix}-contact-select`;

  const closeModalIfBackdrop = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) dialogRef.current?.close();
  };

  const orphanId =
    value && !contacts.some((c) => c.id === value) ? value : null;

  const selectValue = value ?? "";

  return (
    <>
      <div className="win98-form-row">
        <label className="win98-label" htmlFor={selectId}>
          Contacto
        </label>
        <div className="flex min-w-0 flex-1 flex-wrap items-stretch gap-2">
          <select
            id={selectId}
            className="win98-select min-w-0 flex-1"
            value={selectValue}
            onChange={(e) => {
              const v = e.target.value;
              onChange(v === "" ? null : v);
            }}
          >
            <option value="">Sin contacto</option>
            {orphanId ? (
              <option value={orphanId}>— Contacto no en agenda —</option>
            ) : null}
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {contactOptionLabel(c)}
              </option>
            ))}
          </select>
          <button type="button" className="win98-btn shrink-0" onClick={openAddModal}>
            Añadir…
          </button>
        </div>
      </div>
      {portalReady
        ? createPortal(
            <dialog
              ref={dialogRef}
              className="mp-overlay-dialog"
              onClick={closeModalIfBackdrop}
            >
              <div
                className="win98-window flex max-h-[min(92vh,36rem)] w-[min(100vw-1.25rem,26rem)] flex-col overflow-hidden"
                onClick={(ev) => ev.stopPropagation()}
              >
                <div className="win98-titlebar shrink-0">Nuevo contacto</div>
                <form
                  onSubmit={submitContact}
                  className="win98-body flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto"
                >
                  <div className="win98-form-row flex-col sm:flex-row">
                    <label className="win98-label" htmlFor={`${baseId}-cn`}>
                      Nombre
                    </label>
                    <input
                      id={`${baseId}-cn`}
                      className="win98-input flex-1"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      maxLength={200}
                      autoComplete="name"
                    />
                  </div>
                  <div className="win98-form-row flex-col sm:flex-row">
                    <label className="win98-label" htmlFor={`${baseId}-cp`}>
                      Teléfono
                    </label>
                    <input
                      id={`${baseId}-cp`}
                      className="win98-input flex-1"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      maxLength={64}
                      autoComplete="tel"
                    />
                  </div>
                  <div className="win98-form-row flex-col sm:flex-row">
                    <label className="win98-label" htmlFor={`${baseId}-cl`}>
                      Ubicación
                    </label>
                    <input
                      id={`${baseId}-cl`}
                      className="win98-input flex-1"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Taller / dirección"
                      maxLength={500}
                      autoComplete="street-address"
                    />
                  </div>
                  <div className="win98-form-actions">
                    <button type="button" className="win98-btn" onClick={closeModal}>
                      Cancelar
                    </button>
                    <button type="submit" className="win98-btn win98-btn--accent-blue">
                      Guardar
                    </button>
                  </div>
                </form>
              </div>
            </dialog>,
            document.body
          )
        : null}
    </>
  );
}
