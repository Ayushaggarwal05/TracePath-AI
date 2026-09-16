import React from 'react';
import { Modal } from '../common/Modal';
import { DiffViewer } from '../diff/DiffViewer';

interface DiffViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  rawDiff: string;
  updatedContent?: string;
  docPath?: string;
}

export const DiffViewerModal: React.FC<DiffViewerModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  rawDiff,
  updatedContent,
  docPath,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} subtitle={subtitle} maxWidth="5xl">
      <DiffViewer
        rawDiff={rawDiff}
        updatedContent={updatedContent}
        docPath={docPath}
      />
    </Modal>
  );
};
