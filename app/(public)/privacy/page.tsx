import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy & Terms of Use — OMNI Share',
  description: 'Privacy Policy, Terms of Use, and Fair Use Guidelines for the OMNI Share photo room platform.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bg-base">
      {/* Header */}
      <div className="border-b border-bg-border bg-bg-card">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">O</span>
            </div>
            <span className="font-semibold text-text-primary">OMNI Share</span>
          </div>
          <Link href="/login" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
            Back to login
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-12 space-y-12">

        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-1">Privacy Policy &amp; Terms of Use</h1>
          <p className="text-sm text-text-secondary">Last updated: June 2026</p>
          <p className="text-sm text-text-secondary mt-3">
            Your privacy and trust are important to us. This page outlines how we collect, use, and protect your data, and the terms that govern your use of OMNI Share.
          </p>
        </div>

        {/* ── Privacy Policy ── */}
        <section className="space-y-8">
          <h2 className="text-xl font-bold text-text-primary border-b border-bg-border pb-3">Privacy Policy</h2>

          <div className="space-y-2">
            <h3 className="font-semibold text-text-primary">Introduction</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              OMNI Share is a photo room platform that enables room managers to create moderated photo spaces, and members to join and submit photos for display on shared walls and slideshows. This Privacy Policy explains how we collect, use, store, and disclose your personal information when you access and interact with our platform, whether as a room manager, a moderator, a member, or a visitor.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-text-primary">Information We Collect</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              We collect personal information you voluntarily provide when creating an account, including your name, email address, and username. When you join a room, we record your membership and the join code used. When you upload a photo, we store the image file and associated metadata such as upload timestamp, moderation status, and any rejection reason applied by a moderator.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-text-primary">How We Use Your Information</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              We use your information to operate and improve the OMNI Share platform, manage room memberships, process photo submissions and moderation decisions, display approved photos on room walls and slideshows, and communicate with you about your account. We do not sell your personal information to third parties.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-text-primary">Photo Uploads and Storage</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Photos you upload are stored securely and associated with your account. Uploaded photos are subject to moderation by room managers or designated moderators before being displayed publicly. Approved photos may be visible to all members of a room and to anyone viewing the room&apos;s public wall display. You should not upload photos containing sensitive personal information, private images, or content you do not have the right to share.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-text-primary">Photo Moderation</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Room managers and moderators review submitted photos and may approve, reject, or delete them. When a photo is rejected, a reason may be recorded and stored alongside the photo record. Moderation actions are logged in an audit trail visible to room managers for accountability purposes. Moderators are bound by the same terms as other users and may not misuse their access.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-text-primary">Public Wall Display</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Rooms may have a public wall display accessible via a shareable link or QR code. Approved photos in such rooms may be viewable by anyone who accesses the wall URL, including individuals who are not registered members of the platform. Room managers are responsible for determining whether their room&apos;s wall is shared publicly and for ensuring that displayed content is appropriate for their intended audience.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-text-primary">Demo Accounts</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              OMNI Share may provide demo accounts strictly for demonstration purposes. All data within demo accounts is illustrative and does not represent real individuals or events. Demo accounts may be revoked, reset, or modified at any time without notice. To opt out or request deletion of demo data, contact us at{' '}
              <a href="mailto:omniglobal.one@gmail.com" className="text-primary hover:underline">omniglobal.one@gmail.com</a>.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-text-primary">Third-Party Service Providers</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              We engage reputable third-party service providers to host and operate the OMNI Share platform. These providers may process your personal data and stored photos on our behalf solely for the purposes of delivering the service — including file storage, database hosting, authentication, and application infrastructure. Each provider is contractually obligated to protect your data and may only use it for the specific purposes for which it was shared. We do not authorise any third-party provider to sell your personal information.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-text-primary">Data Security</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              We implement appropriate technical and organisational safeguards to protect your personal data and uploaded photos against unauthorised access, loss, or disclosure. These measures include encrypted data transmission, secure authentication, access controls, and role-based permissions. However, no method of internet transmission or electronic storage is completely secure, and we cannot guarantee absolute security.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-text-primary">Your Rights</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              You may request access to, correction of, or deletion of your personal information and uploaded photos at any time by contacting us at{' '}
              <a href="mailto:omniglobal.one@gmail.com" className="text-primary hover:underline">omniglobal.one@gmail.com</a>. We will respond promptly in accordance with applicable laws.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-text-primary">Children&apos;s Privacy</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              OMNI Share is not intended for individuals under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that such information has been collected, we will promptly delete it.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-text-primary">Updates to This Policy</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              We reserve the right to update this Privacy Policy at any time. Changes will be posted on this page, and continued use of the platform constitutes acceptance of the updated policy.
            </p>
          </div>
        </section>

        {/* ── Terms of Use ── */}
        <section className="space-y-8">
          <h2 className="text-xl font-bold text-text-primary border-b border-bg-border pb-3">Terms of Use</h2>

          <div className="space-y-2">
            <h3 className="font-semibold text-text-primary">Acceptance of Terms</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              By accessing and using OMNI Share, you agree to comply with and be bound by these Terms of Use. If you do not agree, please do not use the platform.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-text-primary">Intellectual Property</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              All platform content, including text, logos, design, and software, is protected by copyright and intellectual property laws. You may not copy, distribute, or modify any content without prior written consent from OMNI Global. By uploading a photo, you confirm that you own or have the necessary rights to share that image, and you grant OMNI Share a limited licence to store and display it within the platform as intended.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-text-primary">Room Manager Responsibilities</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Room managers are responsible for the configuration of their rooms, including moderation settings, room visibility, and public wall access. Managers must ensure that their rooms are used in accordance with these Terms and applicable laws. Managers are also responsible for the conduct of moderators they appoint, and for ensuring the wall display is appropriate for the context in which it is shared.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-text-primary">Member Responsibilities</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Members are responsible for the photos they upload. You must not upload content that is illegal, defamatory, obscene, harassing, or that infringes on the rights of others. By submitting a photo, you confirm you have the right to share it and that it is appropriate for the intended audience of the room.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-text-primary">Content Moderation</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              We reserve the right, but not the obligation, to review, remove, or restrict any content that violates these Terms. Moderation decisions by room managers are final within the scope of their rooms. Platform-level moderation decisions by OMNI Global are final and are not subject to appeal.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-text-primary">Prohibited Conduct</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              You agree not to attempt to disrupt, hack, or gain unauthorised access to any part of the platform, upload malicious files, circumvent moderation by re-submitting rejected content, harvest data using automated means, or engage in any activity that degrades the experience of other users.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-text-primary">Account Security</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              You are responsible for maintaining the confidentiality of your login credentials and join codes. You are liable for all activity conducted under your account. Do not share credentials or room management access with unauthorised parties.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-text-primary">Disclaimer of Warranty</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              OMNI Share is provided &quot;as is&quot; without warranties of any kind. We do not guarantee uninterrupted access, accuracy of data, or fitness for a particular purpose. Use of the platform is at your own risk.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-text-primary">Limitation of Liability</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              OMNI Global and its affiliates shall not be liable for any direct, indirect, incidental, or consequential damages arising from your use of the platform, including loss of data, reputational harm, or any claims arising from user-submitted content, even if advised of the possibility of such damages.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-text-primary">Governing Law</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              These Terms shall be governed by the laws of Zimbabwe. Any dispute shall be exclusively resolved in courts located in Zimbabwe.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-text-primary">Changes to Terms</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              We reserve the right to modify these Terms at any time. Continued use of the platform after changes constitutes acceptance of the revised Terms.
            </p>
          </div>
        </section>

        {/* ── Fair Use ── */}
        <section className="space-y-8">
          <h2 className="text-xl font-bold text-text-primary border-b border-bg-border pb-3">Fair Use Guidelines</h2>

          <div className="space-y-2">
            <h3 className="font-semibold text-text-primary">Responsible Usage</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              OMNI Share is designed for genuine photo sharing within organised rooms and events. We monitor platform usage to ensure fairness and reliability for all users. We reserve the right to review, limit, or restrict any usage that is excessive, disruptive, or inconsistent with the platform&apos;s intended purpose — including bulk uploads, automated submissions, or misuse of public wall displays.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-text-primary">Discretion to Serve</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              We retain sole discretion to accept, decline, or discontinue service for any reason, including if we determine that a user&apos;s content or behaviour does not align with our platform values or community standards.
            </p>
          </div>
        </section>

        {/* ── Contact ── */}
        <section className="card p-6 space-y-2">
          <h2 className="font-semibold text-text-primary">Contact Us</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            If you have questions about this Privacy Policy, Terms of Use, or Fair Use Guidelines, or wish to exercise your rights, please contact us at:
          </p>
          <a href="mailto:omniglobal.one@gmail.com" className="text-sm text-primary hover:underline font-medium">
            omniglobal.one@gmail.com
          </a>
        </section>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-bg-border text-xs text-text-tertiary">
          <span>&copy; 2026 OMNI Global. All rights reserved.</span>
          <Link href="/login" className="hover:text-text-secondary transition-colors">Back to login</Link>
        </div>

      </div>
    </div>
  )
}
