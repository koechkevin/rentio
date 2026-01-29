import React, { useState } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import { useUpdateUserProfileMutation } from '../../../../services/api/userProfileApi';

interface UserProfile {
  _id: string;
  displayPicture?: string;
  backgroundPicture?: string;
  about?: string;
  website?: string;
  email: string;
}

interface Props {
  userProfile: UserProfile;
  userId: string;
}

const ProfileHeader = ({ userProfile, userId }: Props) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [displayPicture, setDisplayPicture] = useState<File | null>(null);
  const [backgroundPicture, setBackgroundPicture] = useState<File | null>(null);
  const [updateUserProfile, { isLoading }] = useUpdateUserProfileMutation();

  const handleEditSubmit = async () => {
    const formData = new FormData();
    if (displayPicture) formData.append('displayPicture', displayPicture);
    if (backgroundPicture) formData.append('backgroundPicture', backgroundPicture);

    try {
      await updateUserProfile({ userId, data: formData }).unwrap();
      setShowEditModal(false);
      setDisplayPicture(null);
      setBackgroundPicture(null);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  return (
    <>
      <div className="profile-header" style={{ position: 'relative' }}>
        <img
          src={userProfile.backgroundPicture || '/default-bg.jpg'}
          alt="background"
          style={{ width: '100%', height: '200px', objectFit: 'cover' }}
        />
        <div className="profile-pic-wrapper" style={{ position: 'absolute', bottom: '-40px', left: '20px' }}>
          <img
            src={userProfile.displayPicture || '/default-avatar.jpg'}
            alt="profile"
            style={{ width: '100px', height: '100px', borderRadius: '50%', border: '4px solid white' }}
          />
        </div>
        <Button
          variant="outline-primary"
          size="sm"
          onClick={() => setShowEditModal(true)}
          style={{ position: 'absolute', top: '10px', right: '10px' }}
        >
          Edit Profile
        </Button>
      </div>

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile Pictures</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Display Picture</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setDisplayPicture(e.currentTarget?.files?.[0] || null)
              }
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Background Picture</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setBackgroundPicture(e.currentTarget?.files?.[0] || null)
              }
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleEditSubmit} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ProfileHeader;
