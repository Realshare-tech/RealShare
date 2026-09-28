"use client";
import React, { useState, useEffect } from "react";
import { getAuthHeader } from "@/lib/api-auth";
import styles from "./HomeSections.module.css";
import DeleteOtpModal from "@/components/modals/DeleteOtpModal";

interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image_url: string;
  link_url?: string;
  is_active: boolean;
}

interface Property {
  id: string;
  title: string;
  property_type: string;
}

export function BannersTab() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formSubtitle, setFormSubtitle] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formLink, setFormLink] = useState("");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState("");

  useEffect(() => {
    fetchBanners();
    fetchProperties();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const authHeader = await getAuthHeader();
      const res = await fetch(`/api/cms/banners?all=true`, { headers: authHeader || undefined });
      if (res.ok) setBanners(await res.json());
    } catch (e) {}
    setLoading(false);
  };

  const fetchProperties = async () => {
    try {
      const authHeader = await getAuthHeader();
      const res = await fetch(`/api/properties`, { headers: authHeader || undefined });
      if (res.ok) setProperties(await res.json());
    } catch (e) {}
  };

  const handleSave = async () => {
    if (!formTitle || !formImage) {
      alert("Title and Image URL are required.");
      return;
    }
    try {
      const authHeader = await getAuthHeader();
      const payload = {
        title: formTitle,
        subtitle: formSubtitle,
        image_url: formImage,
        link_url: formLink,
      };
      let res;
      if (isEditing) {
        res = await fetch(`/api/cms/banners/${editId}`, {
          method: "PATCH",
          headers: { ...(authHeader || {}), "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`/api/cms/banners`, {
          method: "POST",
          headers: { ...(authHeader || {}), "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      if (res.ok) {
        setIsModalOpen(false);
        fetchBanners();
      } else {
        const data = await res.json();
        alert("Failed to save: " + data.error);
      }
    } catch (e) {
      alert("An error occurred.");
    }
  };

  const toggleActive = async (id: string, currentVal: boolean) => {
    try {
      const authHeader = await getAuthHeader();
      await fetch(`/api/cms/banners/${id}`, {
        method: "PATCH",
        headers: { ...(authHeader || {}), "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !currentVal }),
      });
      fetchBanners();
    } catch (e) {}
  };

  const handleDelete = (id: string) => {
    setBannerToDelete(id);
    setDeleteModalOpen(true);
  };

  const onConfirmDelete = async (otp: string) => {
    try {
      const authHeader = await getAuthHeader();
      const res = await fetch(`/api/cms/banners/${bannerToDelete}?otp=${encodeURIComponent(otp)}`, {
        method: "DELETE",
        headers: authHeader || undefined,
      });
      if (res.ok) {
        setDeleteModalOpen(false);
        fetchBanners();
      } else {
        const data = await res.json();
        alert(data.error || "Delete failed");
      }
    } catch (e) {}
  };

  return (
    <>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>CMS Sliding Banners</h2>
        <div className={styles.actionsRow}>
          <button
            className={styles.createBtn}
            onClick={() => {
              setIsEditing(false);
              setFormTitle("");
              setFormSubtitle("");
              setFormImage("");
              setFormLink("");
              setIsModalOpen(true);
            }}
          >
            + Create New Banner
          </button>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading banners...</div>
      ) : banners.length === 0 ? (
        <div className={styles.emptyState}>No banners found.</div>
      ) : (
        <div className={styles.grid}>
          {banners.map((b) => (
            <div key={b.id} className={styles.card}>
              <div className={styles.cardImgWrapper}>
                <img src={b.image_url} alt={b.title} className={styles.cardImg} />
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{b.title}</h3>
                {b.subtitle && <p className={styles.cardType}>{b.subtitle}</p>}
                {b.link_url && <p style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>Link: {b.link_url}</p>}
                
                <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                  <button
                    className={styles.addBtn}
                    onClick={() => {
                      setEditId(b.id);
                      setFormTitle(b.title);
                      setFormSubtitle(b.subtitle || "");
                      setFormImage(b.image_url);
                      setFormLink(b.link_url || "");
                      setIsEditing(true);
                      setIsModalOpen(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className={b.is_active ? styles.removeBtn : styles.addBtn}
                    onClick={() => toggleActive(b.id, b.is_active)}
                  >
                    {b.is_active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    className={styles.removeBtn}
                    onClick={() => handleDelete(b.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} style={{ maxWidth: "500px" }}>
            <div className={styles.modalHeader}>
              <h2>{isEditing ? "Edit Banner" : "Create Banner"}</h2>
              <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <div className={styles.modalBody} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <input
                type="text"
                placeholder="Title (e.g. Fractional Ownership)"
                className={styles.searchInput}
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />
              <input
                type="text"
                placeholder="Subtitle"
                className={styles.searchInput}
                value={formSubtitle}
                onChange={(e) => setFormSubtitle(e.target.value)}
              />
              <input
                type="text"
                placeholder="Image URL"
                className={styles.searchInput}
                value={formImage}
                onChange={(e) => setFormImage(e.target.value)}
              />
              
              <div style={{ marginTop: "8px" }}>
                <label style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "4px", display: "block" }}>Link to Property (Optional)</label>
                <select 
                  className={styles.searchInput}
                  value={formLink.startsWith("/property/") ? formLink.replace("/property/", "") : ""}
                  onChange={(e) => {
                    if (e.target.value) {
                      setFormLink(`/property/${e.target.value}`);
                    } else {
                      setFormLink("");
                    }
                  }}
                >
                  <option value="">None (Defaults to Search)</option>
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.title} ({p.property_type})</option>
                  ))}
                </select>
                {formLink && !formLink.startsWith("/property/") && (
                  <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>Current custom link: {formLink}</p>
                )}
              </div>

              <button className={styles.createBtn} onClick={handleSave} style={{ marginTop: "16px" }}>
                Save Banner
              </button>
            </div>
          </div>
        </div>
      )}
      
      {deleteModalOpen && (
        <DeleteOtpModal
          entityName="banner"
          actionKey={`delete_${bannerToDelete}`}
          onCancel={() => setDeleteModalOpen(false)}
          onConfirm={onConfirmDelete}
        />
      )}
    </>
  );
}
