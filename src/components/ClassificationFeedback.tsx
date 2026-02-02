/**
 * Classification Feedback Component
 * 
 * Allows users to confirm, correct, or rate HTS classifications.
 * Supports active learning by collecting user feedback.
 */

'use client';

import React, { useState } from 'react';
import { Button, Rate, Input, Modal, message, Space } from 'antd';
import { CheckOutlined, CloseOutlined, EditOutlined, QuestionOutlined } from '@ant-design/icons';

const { TextArea } = Input;

interface ClassificationFeedbackProps {
  searchHistoryId: string;
  predictedCode: string;
  productDescription: string;
  onFeedbackSubmitted?: () => void;
}

export const ClassificationFeedback: React.FC<ClassificationFeedbackProps> = ({
  searchHistoryId,
  predictedCode,
  productDescription,
  onFeedbackSubmitted,
}) => {
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [correctedCode, setCorrectedCode] = useState('');
  const [correctionReason, setCorrectionReason] = useState('');
  const [qualityRating, setQualityRating] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  
  const submitFeedback = async (
    feedbackType: 'confirmed' | 'corrected' | 'rejected' | 'uncertain',
    additionalData?: {
      correctedCode?: string;
      correctionReason?: string;
      qualityRating?: number;
    }
  ) => {
    setSubmitting(true);
    
    try {
      const response = await fetch('/api/classification-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          searchHistoryId,
          feedbackType,
          ...additionalData,
          engineVersion: 'v10', // Track which engine was used
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        message.success('Thank you for your feedback!');
        setFeedbackGiven(true);
        onFeedbackSubmitted?.();
      } else {
        message.error(data.error || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      message.error('Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleConfirm = () => {
    submitFeedback('confirmed', {
      qualityRating: qualityRating || undefined,
    });
  };
  
  const handleCorrect = () => {
    setShowCorrectionModal(true);
  };
  
  const handleSubmitCorrection = () => {
    if (!correctedCode) {
      message.warning('Please enter the correct HTS code');
      return;
    }
    
    submitFeedback('corrected', {
      correctedCode,
      correctionReason: correctionReason || undefined,
    });
    
    setShowCorrectionModal(false);
  };
  
  const handleReject = () => {
    submitFeedback('rejected');
  };
  
  const handleUncertain = () => {
    submitFeedback('uncertain');
  };
  
  if (feedbackGiven) {
    return (
      <div style={{ 
        padding: '12px', 
        background: '#f6ffed', 
        border: '1px solid #b7eb8f',
        borderRadius: '4px',
        textAlign: 'center'
      }}>
        <CheckOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
        <span style={{ color: '#52c41a' }}>Thank you for your feedback!</span>
      </div>
    );
  }
  
  return (
    <div style={{ padding: '16px', background: '#fafafa', borderRadius: '4px' }}>
      <div style={{ marginBottom: '12px' }}>
        <strong>Was this classification helpful?</strong>
      </div>
      
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space wrap>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={handleConfirm}
            loading={submitting}
          >
            Correct
          </Button>
          
          <Button
            icon={<EditOutlined />}
            onClick={handleCorrect}
            loading={submitting}
          >
            Needs Correction
          </Button>
          
          <Button
            icon={<CloseOutlined />}
            onClick={handleReject}
            loading={submitting}
            danger
          >
            Incorrect
          </Button>
          
          <Button
            icon={<QuestionOutlined />}
            onClick={handleUncertain}
            loading={submitting}
          >
            Not Sure
          </Button>
        </Space>
        
        <div>
          <span style={{ marginRight: '8px' }}>Rate this result:</span>
          <Rate 
            value={qualityRating} 
            onChange={setQualityRating}
            style={{ fontSize: '16px' }}
          />
        </div>
      </Space>
      
      <Modal
        title="Correct Classification"
        open={showCorrectionModal}
        onOk={handleSubmitCorrection}
        onCancel={() => setShowCorrectionModal(false)}
        confirmLoading={submitting}
        okText="Submit Correction"
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Product:</strong> {productDescription}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Predicted Code:</strong> {predictedCode}
            </div>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
              Correct HTS Code *
            </label>
            <Input
              placeholder="e.g., 6109.10.00.12"
              value={correctedCode}
              onChange={(e) => setCorrectedCode(e.target.value)}
              maxLength={14}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
              Reason for Correction (Optional)
            </label>
            <TextArea
              placeholder="Why is this the correct code?"
              value={correctionReason}
              onChange={(e) => setCorrectionReason(e.target.value)}
              rows={3}
              maxLength={500}
            />
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default ClassificationFeedback;
