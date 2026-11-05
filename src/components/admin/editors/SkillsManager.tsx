import React, { useState } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Edit,
  Tag,
  CheckCircle2,
  Filter,
  Layers,
  Sparkles,
  X,
} from 'lucide-react';
import { SkillRecord, ExperienceRecord, ProjectRecord, CertificationRecord } from '../../../types/cms';
import { cmsService } from '../../../services/cmsService';
import { SearchableSelect, SearchableOption } from '../common/SearchableSelect';
import {
  AdminModal,
  AdminModalHeader,
  AdminModalBody,
  AdminModalFooter,
  AdminFormField,
  AdminInput,
  AdminTextarea,
} from '../common/AdminModal';

interface SkillsManagerProps {
  skills: SkillRecord[];
  experiences: ExperienceRecord[];
  projects: ProjectRecord[];
  certifications: CertificationRecord[];
  showNotification: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const DEFAULT_SKILL_CATEGORIES = [
  'Supply Chain Operations',
  'Project Management and Coordination',
  'Business Operations',
  'Enterprise Systems and Reporting',
  'AI and Product Development',
  'Supply Chain & Logistics Systems',
  'Full-Stack & Cloud Architecture',
];

export const SkillsManager: React.FC<SkillsManagerProps> = ({
  skills,
  experiences,
  projects,
  certifications,
  showNotification,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [editingSkill, setEditingSkill] = useState<SkillRecord | null>(null);

  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Supply Chain Operations');
  const [formDesc, setFormDesc] = useState('');

  const categories = React.useMemo(() => {
    const set = new Set<string>(DEFAULT_SKILL_CATEGORIES);
    skills.forEach((s) => {
      if (s.category?.trim()) set.add(s.category.trim());
    });
    return Array.from(set);
  }, [skills]);

  // Calculate usage for a skill name across portfolio entities
  const getSkillUsage = (skillName: string) => {
    const lower = skillName.toLowerCase();
    const usedIn: string[] = [];

    experiences.forEach((e) => {
      if (e.skillsUsed?.some((s) => s.toLowerCase() === lower)) {
        usedIn.push(`Experience: ${e.employer}`);
      }
    });

    projects.forEach((p) => {
      if (
        p.skillsUsed?.some((s) => s.toLowerCase() === lower) ||
        p.technologyStack?.some((s) => s.toLowerCase() === lower)
      ) {
        usedIn.push(`Project: ${p.name}`);
      }
    });

    certifications.forEach((c) => {
      if (c.skillsUsed?.some((s) => s.toLowerCase() === lower)) {
        usedIn.push(`Cert: ${c.title}`);
      }
    });

    return usedIn;
  };

  const handleOpenAdd = () => {
    setEditingSkill(null);
    setFormName('');
    setFormCategory('Supply Chain & Logistics Systems');
    setFormDesc('');
    setIsAddingSkill(true);
  };

  const handleOpenEdit = (skill: SkillRecord) => {
    setEditingSkill(skill);
    setFormName(skill.name);
    setFormCategory(skill.category);
    setFormDesc(skill.description || '');
    setIsAddingSkill(true);
  };

  const handleSaveSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showNotification('Skill name is required.', 'error');
      return;
    }

    if (editingSkill) {
      await cmsService.updateSkill(editingSkill.id, {
        name: formName.trim(),
        category: formCategory,
        description: formDesc.trim(),
      });
      showNotification(`Skill "${formName}" updated.`);
    } else {
      await cmsService.addSkill({
        name: formName.trim(),
        category: formCategory,
        description: formDesc.trim(),
        displayOrder: skills.length + 1,
      });
      showNotification(`Skill "${formName}" added to central library.`);
    }
    setIsAddingSkill(false);
  };

  const handleDeleteSkill = async (skill: SkillRecord) => {
    const usage = getSkillUsage(skill.name);
    if (usage.length > 0) {
      const confirm = window.confirm(
        `Notice: "${skill.name}" is referenced in:\n• ${usage.join('\n• ')}\n\nDelete this skill anyway?`
      );
      if (!confirm) return;
    } else {
      if (!window.confirm(`Delete skill "${skill.name}"?`)) return;
    }

    await cmsService.deleteSkill(skill.id);
    showNotification(`Skill "${skill.name}" deleted.`);
  };

  const handleRemoveDuplicates = async () => {
    const seen = new Set<string>();
    const duplicates: SkillRecord[] = [];

    skills.forEach((s) => {
      const normalized = s.name.trim().toLowerCase();
      if (seen.has(normalized)) {
        duplicates.push(s);
      } else {
        seen.add(normalized);
      }
    });

    if (duplicates.length === 0) {
      showNotification('No duplicate skills detected.', 'info');
      return;
    }

    for (const dup of duplicates) {
      await cmsService.deleteSkill(dup.id);
    }
    showNotification(`Removed ${duplicates.length} duplicate skill entry(s).`);
  };

  const filtered = skills.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || s.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          paddingBottom: '20px',
          borderBottom: '1px solid rgba(244, 243, 238, 0.08)',
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '24px',
              fontWeight: 600,
              color: '#F4F3EE',
              margin: 0,
            }}
          >
            Central Skills &amp; Capabilities Library
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              color: '#A7B0A9',
              margin: '4px 0 0',
            }}
          >
            Central matrix of technical tools, supply chain protocols, and AI competencies shared across experiences, projects, and certifications.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={handleRemoveDuplicates}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '6px',
              backgroundColor: 'rgba(244, 243, 238, 0.05)',
              border: '1px solid rgba(244, 243, 238, 0.12)',
              color: '#C1C4BE',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            <Sparkles size={13} />
            Deduplicate
          </button>
          <button
            type="button"
            onClick={handleOpenAdd}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: '#F4F3EE',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Plus size={14} />
            Add Skill
          </button>
        </div>
      </div>

      {/* Controls: Search & Category Filter */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search skills by keyword or discipline..."
            style={{
              width: '100%',
              padding: '10px 12px 10px 34px',
              borderRadius: '6px',
              backgroundColor: 'rgba(18, 18, 22, 0.72)',
              border: '1px solid rgba(244, 243, 238, 0.1)',
              color: '#F4F3EE',
              fontSize: '13px',
              outline: 'none',
            }}
          />
          <Search
            size={14}
            color="#8E948D"
            style={{ position: 'absolute', left: '12px', top: '12px' }}
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            padding: '10px 14px',
            borderRadius: '6px',
            backgroundColor: 'rgba(18, 18, 22, 0.72)',
            border: '1px solid rgba(244, 243, 238, 0.1)',
            color: '#F4F3EE',
            fontSize: '13px',
            outline: 'none',
          }}
        >
          <option value="All">All Categories ({skills.length})</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Skills Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '14px',
        }}
      >
        {filtered.map((skill) => {
          const usage = getSkillUsage(skill.name);
          return (
            <div
              key={skill.id}
              style={{
                backgroundColor: 'rgba(18, 18, 22, 0.72)',
                border: '1px solid rgba(244, 243, 238, 0.08)',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '6px',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '15px',
                      fontWeight: 600,
                      color: '#F4F3EE',
                    }}
                  >
                    {skill.name}
                  </span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(skill)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#8294A6',
                        cursor: 'pointer',
                        padding: '3px',
                      }}
                    >
                      <Edit size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSkill(skill)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#E06C75',
                        cursor: 'pointer',
                        padding: '3px',
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '11px',
                    color: '#8294A6',
                    marginBottom: '8px',
                  }}
                >
                  {skill.category}
                </div>

                {skill.description && (
                  <p
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '12px',
                      color: '#A7B0A9',
                      lineHeight: 1.4,
                      margin: '0 0 10px',
                    }}
                  >
                    {skill.description}
                  </p>
                )}
              </div>

              {/* Usage pill */}
              <div
                style={{
                  paddingTop: '10px',
                  borderTop: '1px solid rgba(244, 243, 238, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '11px',
                  fontFamily: 'var(--font-body)',
                }}
              >
                <span style={{ color: '#8E948D' }}>Used in:</span>
                <span
                  style={{
                    padding: '2px 6px',
                    borderRadius: '10px',
                    backgroundColor:
                      usage.length > 0 ? 'rgba(74, 180, 120, 0.15)' : 'rgba(244, 243, 238, 0.05)',
                    color: usage.length > 0 ? '#6CE098' : '#8E948D',
                    fontWeight: 600,
                  }}
                >
                  {usage.length} reference{usage.length === 1 ? '' : 's'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div
          style={{
            padding: '40px',
            textAlign: 'center',
            backgroundColor: 'rgba(18, 18, 22, 0.72)',
            borderRadius: '8px',
            border: '1px dashed rgba(244, 243, 238, 0.1)',
            color: '#8E948D',
            fontSize: '13px',
          }}
        >
          No skills matched &ldquo;{searchQuery}&rdquo;. Click &ldquo;Add Skill&rdquo; to create a new capability entry.
        </div>
      )}

      {/* Add / Edit Skill Modal */}
      {isAddingSkill && (
        <AdminModal
          isOpen={isAddingSkill}
          onClose={() => setIsAddingSkill(false)}
          size="sm"
          maxWidth="540px"
          ariaLabel={editingSkill ? 'Edit Skill' : 'Add New Skill'}
        >
          <AdminModalHeader
            title={editingSkill ? 'Edit Skill' : 'Add New Skill'}
            subtitle="Catalog and categorize technical abilities across portfolio modules."
            icon={<Sparkles size={16} />}
            onClose={() => setIsAddingSkill(false)}
          />

          <form onSubmit={handleSaveSkill} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <AdminModalBody padding="22px">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <AdminFormField label="Skill Name" required={true}>
                  <AdminInput
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Claude AI, Logistics Workflow Mapping..."
                  />
                </AdminFormField>

                <div>
                  <SearchableSelect
                    label="Capability Category"
                    options={categories.map((c) => ({
                      value: c,
                      label: c,
                      icon: <Layers size={13} color="#D5D2D6" />,
                    }))}
                    value={formCategory}
                    onChange={(val) => setFormCategory(val)}
                    placeholder="Select or enter category..."
                    searchPlaceholder="Search category or type custom..."
                    allowCustom={true}
                    customPrompt="Add category:"
                    clearable={false}
                  />
                </div>

                <AdminFormField
                  label="Technical Scope & Context (Optional)"
                  helpText="Brief context of how this skill is applied in projects or operations."
                >
                  <AdminTextarea
                    rows={3}
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Brief context of how this skill is applied..."
                  />
                </AdminFormField>
              </div>
            </AdminModalBody>

            <AdminModalFooter
              onCancel={() => setIsAddingSkill(false)}
              saveText={editingSkill ? 'Save Changes' : 'Create Skill'}
              saveType="submit"
            />
          </form>
        </AdminModal>
      )}
    </div>
  );
};
