import { useAuth } from "../context/AuthContext";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { acceptInvite, getInvite } from "../services/inviteService";
import '../styles/Invite.css';

// http://localhost:5173/invite/5d0f5367-678a-461f-876f-a7b45daffb9e

export function Invite() {
  const { user, updateUserOrganization, updateUserRole } = useAuth();
  const { invite_token } = useParams();
  const [loading, setLoading] = useState(false);
  const [accepting, setAccepting] = useState(false);

  const [invite, setInvite] = useState({
    id: null,
    token: "",
    organizationId: null,
    roleId: null,
    isRevoled: null,
    createdAt: null,
  });

  useEffect(() => {
    const fetchInvite = async () => {
      try {
        setLoading(true);
        const response = await getInvite(invite_token);
        setInvite(response);
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };

    fetchInvite();
  }, [invite_token]);

  const handleInviteAccaption = async () => {
    try {
      setAccepting(true);
      const response = await acceptInvite(invite_token, user.id);
      updateUserOrganization(response.organizationId);
      updateUserRole(response.roleId);
    } catch (e) {
      console.log(e);
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="invite-page">
        <div className="invite-loading">
          <div className="pulse">⏳</div>
          <div>Проверка приглашения...</div>
        </div>
      </div>
    );
  }
  
  if (!invite) {
    return (
      <div className="invite-page">
        <div className="invite-error">
          <div className="invite-icon">⚠️</div>
          <div>Приглашение недействительно или истекло</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="invite-page">
      <div className="invite-container">
        <div className="invite-header">
          <h2>Приглашение в организацию</h2>
          <div className="invite-info">
            <div><h3>{invite.organizationName}</h3></div>
            {/* <div><h3>Роль: <string>{invite.roleName}</string></h3></div> */}
          </div>
        </div>
        
        <div className="invite-actions">
          <button 
            onClick={handleInviteAccaption} 
            disabled={accepting}
            className="btn-invite-accept"
          >
            {accepting ? 'Принимаем...' : 'Принять приглашение'}
          </button>
          <button 
            // onClick={handleCancel}
            className="btn-invite-reject"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
  
  
  
}
