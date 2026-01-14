// This file contains THREE SEPARATE React resume templates.
// Each template is an independent component.
// No dummy data is included – all content comes from props.
// You can render any template based on user selection.

import React from 'react';

/* =====================================================
   TEMPLATE 1 – Two Column Executive / Architect Resume
   (Matches first screenshot – photo + teal sidebar)
===================================================== */

export function ResumeTemplateOne({ profile }: { profile: any }) {
  return (
    <div style={styles.t1.container}>
      <aside style={styles.t1.sidebar}>
        {profile.photo && <img src={profile.photo} style={styles.t1.photo} alt="Profile" />}

        <section style={styles.t1.block}>
          <h3 style={styles.t1.sidebarHeader}>Contact</h3>
          <div style={styles.t1.sidebarContent}>{profile.contact}</div>
        </section>

        <section style={styles.t1.block}>
          <h3 style={styles.t1.sidebarHeader}>Summary</h3>
          <div style={styles.t1.sidebarContent}>{profile.summary}</div>
        </section>

        <section style={styles.t1.block}>
          <h3 style={styles.t1.sidebarHeader}>Skills</h3>
          <div style={styles.t1.sidebarContent}>{profile.skills}</div>
        </section>
      </aside>

      <main style={styles.t1.main}>
        <h1 style={styles.t1.name}>{profile.name}</h1>

        <section style={styles.t1.section}>
          <h2 style={styles.t1.sectionHeader}>Work History</h2>
          <div style={styles.t1.sectionContent}>{profile.experience}</div>
        </section>

        <section style={styles.t1.section}>
          <h2 style={styles.t1.sectionHeader}>Education</h2>
          <div style={styles.t1.sectionContent}>{profile.education}</div>
        </section>

        <section style={styles.t1.section}>
          <h2 style={styles.t1.sectionHeader}>Accomplishments</h2>
          <div style={styles.t1.sectionContent}>{profile.achievements}</div>
        </section>
      </main>
    </div>
  );
}

/* =====================================================
   TEMPLATE 2 – Modern Corporate / CX Leader Resume
   (Matches second screenshot – clean, bold headings)
===================================================== */

export function ResumeTemplateTwo({ profile }: { profile: any }) {
  return (
    <div style={styles.t2.container}>
      <header style={styles.t2.header}>
        <h1 style={styles.t2.name}>{profile.name}</h1>
        <p style={styles.t2.title}>{profile.title}</p>
        <div style={styles.t2.contact}>{profile.contact}</div>
      </header>

      <div style={styles.t2.body}>
        <main style={styles.t2.left}>
          <section style={styles.t2.section}>
            <h2 style={styles.t2.sectionHeader}>Professional Summary</h2>
            <div style={styles.t2.content}>{profile.summary}</div>
          </section>
          
          <section style={styles.t2.section}>
            <h2 style={styles.t2.sectionHeader}>Work Experience</h2>
            <div style={styles.t2.content}>{profile.experience}</div>
          </section>
        </main>

        <aside style={styles.t2.right}>
          <section style={styles.t2.sidebarSection}>
            <h3 style={styles.t2.sidebarHeader}>Key Achievements</h3>
            <div style={styles.t2.sidebarContent}>{profile.achievements}</div>
          </section>

          <section style={styles.t2.sidebarSection}>
            <h3 style={styles.t2.sidebarHeader}>Technical Skills</h3>
            <div style={styles.t2.sidebarContent}>{profile.skills}</div>
          </section>

          <section style={styles.t2.sidebarSection}>
            <h3 style={styles.t2.sidebarHeader}>Education</h3>
            <div style={styles.t2.sidebarContent}>{profile.education}</div>
          </section>

          <section style={styles.t2.sidebarSection}>
            <h3 style={styles.t2.sidebarHeader}>Training / Courses</h3>
            <div style={styles.t2.sidebarContent}>{profile.courses}</div>
          </section>
        </aside>
      </div>
    </div>
  );
}

/* =====================================================
   TEMPLATE 3 – Minimal Senior Software Engineer Resume
   (Matches third screenshot – serif, single column)
===================================================== */

export function ResumeTemplateThree({ profile }: { profile: any }) {
  return (
    <div style={styles.t3.container}>
      <header style={styles.t3.header}>
        <h1 style={styles.t3.name}>{profile.name}</h1>
        <p style={styles.t3.title}>{profile.title}</p>
        <div style={styles.t3.contact}>{profile.contact}</div>
      </header>

      <section style={styles.t3.section}>
        <h2 style={styles.t3.sectionHeader}>Professional Summary</h2>
        <div style={styles.t3.content}>{profile.summary}</div>
      </section>

      <section style={styles.t3.section}>
        <h2 style={styles.t3.sectionHeader}>Work Experience</h2>
        <div style={styles.t3.content}>{profile.experience}</div>
      </section>

      <section style={styles.t3.section}>
        <h2 style={styles.t3.sectionHeader}>Technical Skills</h2>
        <div style={styles.t3.content}>{profile.skills}</div>
      </section>

      <section style={styles.t3.section}>
        <h2 style={styles.t3.sectionHeader}>Education</h2>
        <div style={styles.t3.content}>{profile.education}</div>
      </section>

      <section style={styles.t3.section}>
        <h2 style={styles.t3.sectionHeader}>Key Achievements</h2>
        <div style={styles.t3.content}>{profile.achievements}</div>
      </section>
    </div>
  );
}

/* =====================================================
   STYLES (Inline for portability in no‑code / builders)
===================================================== */

const styles = {
  t1: {
    container: { 
      display: 'flex', 
      fontFamily: 'Arial, sans-serif', 
      minHeight: '100vh',
      backgroundColor: '#ffffff'
    },
    sidebar: { 
      width: '30%', 
      background: '#0f9bb4', 
      color: '#fff', 
      padding: '24px',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '24px'
    },
    photo: { 
      width: '100%', 
      borderRadius: '8px', 
      marginBottom: '20px',
      border: '3px solid white'
    },
    block: { 
      marginBottom: '24px' 
    },
    sidebarHeader: {
      fontSize: '16px',
      fontWeight: 'bold' as const,
      marginBottom: '12px',
      color: '#ffffff',
      borderBottom: '2px solid rgba(255,255,255,0.3)',
      paddingBottom: '8px'
    },
    sidebarContent: {
      fontSize: '14px',
      lineHeight: '1.5'
    },
    main: { 
      width: '70%', 
      padding: '32px',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '32px'
    },
    name: { 
      fontSize: '36px', 
      color: '#0f9bb4',
      fontWeight: 'bold' as const,
      marginBottom: '8px'
    },
    section: { 
      marginBottom: '32px' 
    },
    sectionHeader: {
      fontSize: '20px',
      fontWeight: 'bold' as const,
      color: '#333',
      marginBottom: '16px',
      borderBottom: '2px solid #0f9bb4',
      paddingBottom: '8px'
    },
    sectionContent: {
      fontSize: '14px',
      lineHeight: '1.6'
    }
  },

  t2: {
    container: { 
      fontFamily: 'Inter, Arial, sans-serif', 
      padding: '32px',
      backgroundColor: '#ffffff',
      maxWidth: '1000px',
      margin: '0 auto'
    },
    header: { 
      borderBottom: '2px solid #000', 
      paddingBottom: '16px', 
      marginBottom: '24px' 
    },
    name: {
      fontSize: '32px',
      fontWeight: 'bold' as const,
      margin: '0 0 8px 0',
      color: '#000'
    },
    title: {
      fontSize: '18px',
      fontWeight: 'normal' as const,
      margin: '0 0 16px 0',
      color: '#666'
    },
    contact: {
      fontSize: '14px',
      color: '#333',
      lineHeight: '1.5'
    },
    body: { 
      display: 'flex', 
      gap: '32px' 
    },
    left: { 
      width: '65%' 
    },
    right: { 
      width: '35%' 
    },
    section: {
      marginBottom: '24px'
    },
    sectionHeader: {
      fontSize: '18px',
      fontWeight: 'bold' as const,
      color: '#000',
      marginBottom: '12px',
      borderBottom: '1px solid #ccc',
      paddingBottom: '6px'
    },
    content: {
      fontSize: '14px',
      lineHeight: '1.6',
      color: '#333'
    },
    sidebarSection: {
      marginBottom: '20px',
      backgroundColor: '#f8f9fa',
      padding: '16px',
      borderRadius: '6px'
    },
    sidebarHeader: {
      fontSize: '16px',
      fontWeight: 'bold' as const,
      color: '#000',
      marginBottom: '10px'
    },
    sidebarContent: {
      fontSize: '13px',
      lineHeight: '1.5',
      color: '#444'
    }
  },

  t3: {
    container: { 
      fontFamily: 'Georgia, serif', 
      padding: '48px', 
      maxWidth: '900px', 
      margin: '0 auto',
      backgroundColor: '#ffffff'
    },
    header: { 
      textAlign: 'center' as const, 
      marginBottom: '40px',
      borderBottom: '1px solid #ddd',
      paddingBottom: '20px'
    },
    name: {
      fontSize: '28px',
      fontWeight: 'normal' as const,
      margin: '0 0 8px 0',
      color: '#000',
      letterSpacing: '1px'
    },
    title: {
      fontSize: '16px',
      fontWeight: 'normal' as const,
      margin: '0 0 12px 0',
      color: '#666',
      fontStyle: 'italic' as const
    },
    contact: {
      fontSize: '14px',
      color: '#333',
      lineHeight: '1.5'
    },
    section: { 
      marginBottom: '32px' 
    },
    sectionHeader: {
      fontSize: '18px',
      fontWeight: 'normal' as const,
      color: '#000',
      marginBottom: '16px',
      borderBottom: '1px solid #999',
      paddingBottom: '6px',
      fontStyle: 'italic' as const
    },
    content: {
      fontSize: '14px',
      lineHeight: '1.7',
      color: '#333'
    }
  }
};

/* =====================================================
   TEMPLATE RENDERER FUNCTION
===================================================== */

export function renderResumeTemplate(templateNumber: number, profile: any) {
  switch(templateNumber) {
    case 1:
      return <ResumeTemplateOne profile={profile} />;
    case 2:
      return <ResumeTemplateTwo profile={profile} />;
    case 3:
      return <ResumeTemplateThree profile={profile} />;
    default:
      return <ResumeTemplateOne profile={profile} />;
  }
}

/* =====================================================
   USAGE EXAMPLE (logic only – no data):

   {selected === 1 && <ResumeTemplateOne profile={data} />}
   {selected === 2 && <ResumeTemplateTwo profile={data} />}
   {selected === 3 && <ResumeTemplateThree profile={data} />}
===================================================== */