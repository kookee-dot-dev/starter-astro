import { useEffect, useId, useRef, useState, type MouseEvent } from 'react';
import type { AnnouncementDetail, AnnouncementListItem } from '@kookee/sdk';
import { AnnouncementArticle, AnnouncementList, AnnouncementPill } from '@kookee/react/announcements';
import { useDismissedAnnouncements } from '@kookee/react/announcements/client';

// The announcements arrive in full from the build, so opening one makes no request. Dismissals are
// kept in the visitor's localStorage, so the pill shows only once the island has hydrated.

export default function Announcements({ announcements }: { announcements: AnnouncementDetail[] }) {
  const { visible, dismiss } = useDismissedAnnouncements<AnnouncementListItem>({ announcements });
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const titleId = useId();
  const selected = announcements.find((announcement) => announcement.id === selectedId);

  // Opened after the content renders, so the dialog moves focus into it.
  useEffect(() => {
    if (open) dialogRef.current?.showModal();
  }, [open]);

  // Escape, the close button and a click on the backdrop all end in the dialog's close event.
  const onClose = () => {
    setOpen(false);
    setSelectedId(null);
  };

  const onBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) event.currentTarget.close();
  };

  const back = () => {
    setSelectedId(null);
    titleRef.current?.focus();
  };

  return (
    <>
      {visible.length > 0 && (
        <div className="site-announcement-slot">
          <AnnouncementPill announcement={visible[0]} onOpen={() => setOpen(true)} onDismiss={dismiss} />
        </div>
      )}
      <dialog
        ref={dialogRef}
        className="site-dialog"
        aria-labelledby={titleId}
        onClose={onClose}
        onClick={onBackdropClick}
      >
        {open && (
          <>
            <div className="site-dialog-header">
              <h2 id={titleId} ref={titleRef} tabIndex={-1}>
                Announcements
              </h2>
              <button
                type="button"
                className="site-dialog-close"
                aria-label="Close"
                onClick={() => dialogRef.current?.close()}
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="site-dialog-body">
              {selected ? (
                <>
                  <button type="button" className="site-dialog-back" onClick={back} autoFocus>
                    <span aria-hidden="true">←</span> Back
                  </button>
                  <AnnouncementArticle announcement={selected} headingLevel={3} />
                </>
              ) : (
                <AnnouncementList
                  announcements={visible}
                  onSelect={(announcement) => setSelectedId(announcement.id)}
                  onDismiss={dismiss}
                />
              )}
            </div>
          </>
        )}
      </dialog>
    </>
  );
}
