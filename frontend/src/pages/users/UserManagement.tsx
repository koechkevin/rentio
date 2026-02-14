import { JSX, useState } from 'react';
import { Row, Col, Card, Table, Badge, Button, Form, Alert, Spinner, Modal, InputGroup } from 'react-bootstrap';
import { UserPlus, Trash2, Mail, User, Shield, Check, X } from 'lucide-react';
import { useGetPropertyUsersQuery, useAssignRoleMutation, useRevokeRoleMutation } from '../../services/api/userApi';
import { UserRole, type PropertyUser } from '../../types/user.types';
import { useAppSelector } from '@/store/store';
import { useCheckEmailExistsMutation } from '../../services/api/authApi';

const UserManagement = () => {
  const { currentPropertyId } = useAppSelector((state) => state.property);
  const [email, setEmail] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.CARETAKER);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [userToRevoke, setUserToRevoke] = useState<PropertyUser | null>(null);
  const [assignError, setAssignError] = useState<string>('');
  const [assignSuccess, setAssignSuccess] = useState<string>('');
  const [emailExists, setEmailExists] = useState<boolean | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailChecked, setEmailChecked] = useState(false);

  const {
    data: usersData,
    isLoading: loadingUsers,
    error: usersError,
  } = useGetPropertyUsersQuery(
    { propertyId: currentPropertyId || '', role: UserRole.CARETAKER },
    { skip: !currentPropertyId }
  );

  const [assignRole, { isLoading: assigningRole }] = useAssignRoleMutation();
  const [revokeRole, { isLoading: revokingRole }] = useRevokeRoleMutation();
  const [checkEmailExists] = useCheckEmailExistsMutation();

  const handleEmailBlur = async () => {
    if (!email.trim()) {
      setEmailChecked(false);
      setEmailExists(null);
      return;
    }

    setCheckingEmail(true);
    try {
      const response = await checkEmailExists({ email: email.trim() }).unwrap();
      setEmailExists(response.exists);
      setEmailChecked(true);

      if (response.exists) {
        setNationalId('');
        setPhone('');
      }
    } catch (error) {
      console.error('Error checking email:', error);
      setEmailChecked(false);
    } finally {
      setCheckingEmail(false);
    }
  };

  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPropertyId) return;

    if (!emailChecked) {
      setAssignError('Please check email first');
      return;
    }

    if (!emailExists && (!nationalId.trim() || !phone.trim())) {
      setAssignError('National ID and phone are required for new users');
      return;
    }

    setAssignError('');
    setAssignSuccess('');

    try {
      const response = await assignRole({
        propertyId: currentPropertyId,
        data: {
          email: email.trim(),
          role: selectedRole,
          ...(emailExists ? {} : { nationalId: nationalId.trim(), phone: phone.trim() }),
        },
      }).unwrap();

      if (response.success) {
        setAssignSuccess(response.message || 'User assigned successfully!');
        setEmail('');
        setNationalId('');
        setPhone('');
        setSelectedRole(UserRole.CARETAKER);
        setEmailChecked(false);
        setEmailExists(null);
      }
    } catch (error: any) {
      setAssignError(error.data?.message || 'Failed to assign role');
    }
  };

  const handleRevokeRole = async () => {
    if (!currentPropertyId || !userToRevoke) return;

    try {
      await revokeRole({
        propertyId: currentPropertyId,
        userId: userToRevoke.user.id,
      }).unwrap();

      setShowRevokeModal(false);
      setUserToRevoke(null);
    } catch (error: any) {
      alert(error.data?.message || 'Failed to revoke role');
    }
  };

  const getRoleVariant = (role: UserRole): string => {
    const variants: Record<UserRole, string> = {
      OWNER: 'primary',
      CARETAKER: 'info',
      TENANT: 'secondary',
    };
    return variants[role] || 'secondary';
  };

  const getRoleIcon = (role: UserRole) => {
    const icons: Record<UserRole, JSX.Element> = {
      OWNER: <Shield size={16} />,
      CARETAKER: <User size={16} />,
      TENANT: <User size={16} />,
    };
    return icons[role] || <User size={16} />;
  };

  if (!currentPropertyId) {
    return <Alert variant="warning">Please select a property to manage users.</Alert>;
  }

  if (loadingUsers) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (usersError) {
    return (
      <Alert variant="danger" className="m-3">
        Error loading users: {JSON.stringify(usersError)}
      </Alert>
    );
  }

  const users = usersData?.data || [];

  return (
    <>
      <Row>
        <Col xl={12}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title as="h4" className="mb-4">
                User Management - {currentPropertyId}
              </Card.Title>

              {/* Assign Role Form */}
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">
                    <UserPlus size={20} className="me-2" />
                    Assign User Role
                  </h5>
                </Card.Header>
                <Card.Body>
                  {assignError && (
                    <Alert variant="danger" dismissible onClose={() => setAssignError('')}>
                      {assignError}
                    </Alert>
                  )}
                  {assignSuccess && (
                    <Alert variant="success" dismissible onClose={() => setAssignSuccess('')}>
                      {assignSuccess}
                    </Alert>
                  )}

                  <Form onSubmit={handleAssignRole}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Email Address</Form.Label>
                          <InputGroup>
                            <InputGroup.Text>
                              <Mail size={16} />
                            </InputGroup.Text>
                            <Form.Control
                              type="email"
                              placeholder="Enter user's email address"
                              value={email}
                              onChange={(e) => {
                                setEmail(e.target.value);
                                setEmailChecked(false);
                              }}
                              onBlur={handleEmailBlur}
                              disabled={checkingEmail}
                              required
                              isInvalid={emailChecked && !emailExists}
                            />
                            {checkingEmail && (
                              <InputGroup.Text>
                                <Spinner size="sm" animation="border" />
                              </InputGroup.Text>
                            )}
                            {emailChecked && !checkingEmail && (
                              <InputGroup.Text className={emailExists ? 'text-success' : 'text-danger'}>
                                {emailExists ? <Check size={16} /> : <X size={16} />}
                              </InputGroup.Text>
                            )}
                          </InputGroup>
                          {emailChecked && !emailExists && (
                            <Form.Text className="text-muted d-block mt-1">
                              New user will be created. Please provide National ID and Phone.
                            </Form.Text>
                          )}
                        </Form.Group>
                      </Col>

                      {emailChecked && !emailExists && (
                        <>
                          <Col md={3}>
                            <Form.Group className="mb-3">
                              <Form.Label>National ID *</Form.Label>
                              <Form.Control
                                type="text"
                                placeholder="National ID"
                                value={nationalId}
                                onChange={(e) => setNationalId(e.target.value)}
                                required={!emailExists}
                              />
                            </Form.Group>
                          </Col>
                          <Col md={3}>
                            <Form.Group className="mb-3">
                              <Form.Label>Phone *</Form.Label>
                              <Form.Control
                                type="tel"
                                placeholder="Phone number"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required={!emailExists}
                              />
                            </Form.Group>
                          </Col>
                        </>
                      )}

                      <Col md={emailChecked && !emailExists ? 12 : 4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Role</Form.Label>
                          <Form.Select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                            disabled={!emailChecked}
                          >
                            <option value={UserRole.CARETAKER}>Caretaker</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>

                      <Col md={emailChecked && !emailExists ? 12 : 2}>
                        <Form.Group className="mb-3">
                          <Form.Label>&nbsp;</Form.Label>
                          <div>
                            <Button
                              type="submit"
                              variant="primary"
                              disabled={assigningRole || !emailChecked}
                              className="w-100"
                            >
                              {assigningRole ? (
                                <Spinner size="sm" animation="border" />
                              ) : (
                                <>
                                  <UserPlus size={16} className="me-2" />
                                  Assign
                                </>
                              )}
                            </Button>
                          </div>
                        </Form.Group>
                      </Col>
                    </Row>
                  </Form>
                </Card.Body>
              </Card>

              {/* Users List */}
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Property Users ({users.length})</h5>
                </Card.Header>
                <Card.Body className="p-0">
                  <div className="table-responsive">
                    <Table striped bordered hover className="mb-0">
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Assigned Date</th>
                          <th>Assigned By</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center py-4">
                              No users assigned to this property
                            </td>
                          </tr>
                        ) : (
                          users.map((propertyUser: PropertyUser) => (
                            <tr key={propertyUser.id}>
                              <td>
                                <div className="d-flex align-items-center">
                                  {getRoleIcon(propertyUser.role)}
                                  <span className="ms-2">{propertyUser.user.fullName}</span>
                                </div>
                              </td>
                              <td>{propertyUser.user.email}</td>
                              <td>
                                <Badge bg={getRoleVariant(propertyUser.role)}>{propertyUser.role}</Badge>
                              </td>
                              <td>{new Date(propertyUser.createdAt).toLocaleDateString()}</td>
                              <td>{propertyUser.assignedByUser.fullName}</td>
                              <td>
                                {propertyUser.role !== UserRole.OWNER && (
                                  <Button
                                    variant="link"
                                    size="sm"
                                    className="text-danger p-1"
                                    onClick={() => {
                                      setUserToRevoke(propertyUser);
                                      setShowRevokeModal(true);
                                    }}
                                    title="Revoke Access"
                                  >
                                    <Trash2 size={16} />
                                  </Button>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Revoke Role Confirmation Modal */}
      <Modal show={showRevokeModal} onHide={() => setShowRevokeModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Revoke Access</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {userToRevoke && (
            <p>
              Are you sure you want to revoke <strong>{userToRevoke.role}</strong> access for{' '}
              <strong>{userToRevoke.user.fullName}</strong> ({userToRevoke.user.email})?
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRevokeModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleRevokeRole} disabled={revokingRole}>
            {revokingRole ? <Spinner size="sm" animation="border" /> : 'Revoke Access'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

const getRoleVariant = (role: UserRole): string => {
  const variants: Record<UserRole, string> = {
    OWNER: 'primary',
    CARETAKER: 'info',
    TENANT: 'secondary',
  };
  return variants[role] || 'secondary';
};

const getRoleIcon = (role: UserRole) => {
  const icons: Record<UserRole, JSX.Element> = {
    OWNER: <Shield size={16} />,
    CARETAKER: <User size={16} />,
    TENANT: <User size={16} />,
  };
  return icons[role] || <User size={16} />;
};

export default UserManagement;
