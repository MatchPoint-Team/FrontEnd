import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { userState } from '../../../../../recoil/locals/login/atoms/atom';
import Invite from '../invite-modal/Invite';
import SetRoom from '../setroom-modal/SetRoom';
import What from '../../../../../assets/icon/what.svg';
import Plus from '../../../../../assets/icon/plus.svg';
import { channelIdState } from '../../../../../recoil/locals/chat/atoms/atom';
import { UserChannel, useUserChannels } from '../../../../../api/ChatRoomInfo';
import { useAddFriendMutation } from '../../../../../api/AddFriend';
import { useSetAdminMutation } from '../../../../../api/SetAdmin';

// 모달 prop 타입
interface Props {
  isOpenSideModal: boolean;
  handleClickModal: () => void;
}

export default function RoomSide({ isOpenSideModal, handleClickModal }: Props) {
  const navigate = useNavigate();

  // 유저  정보
  const userInfo = useRecoilValue(userState);

  // 채널 Id
  const channelId = useRecoilValue(channelIdState);

  // react-query 채팅방 멤버 정보
  const { data: userChannels } = useUserChannels(channelId, userInfo.token);

  const { mutate: addFriendMutation } = useAddFriendMutation(
    channelId,
    userInfo.token,
  );

  const { mutate: setAdminMutation } = useSetAdminMutation(
    channelId,
    userInfo.token,
  );

  const handleAddFriend = async (userChannel: UserChannel) => {
    try {
      if (userInfo.userId === userChannel.user.userId) {
        alert('본인입니다');
      }
      if (userChannel.isFriend) {
        alert('이미 친구인 유저입니다');
      }
      await addFriendMutation({
        userId: userChannel.user.userId,
        token: userInfo.token,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleSetAdmin = async (userChannel: UserChannel) => {
    try {
      if (userChannel.isAdmin) {
        alert('이미 관리자인 유저입니다');
      }
      await setAdminMutation({
        channelId,
        userId: userChannel.user.userId,
        token: userInfo.token,
      });
    } catch (error) {
      console.log(error);
    }
  };

  // 채팅방 설정 모달
  const [isOpenSetRoomModal, setIsOpenSetRoomModal] = useState<boolean>(false);
  const handleClickSetRoomModal = () => {
    setIsOpenSetRoomModal(!isOpenSetRoomModal);
  };

  // 친구 초대 모달
  const [isOpenInviteModal, setIsOpenInviteModal] = useState<boolean>(false);
  const handleClickSetInviteModal = () => {
    setIsOpenInviteModal(!isOpenInviteModal);
  };

  const handleClickExit = () => {
    const exit = async () => {
      await axios.delete(`http://localhost:3000/channels/${channelId}`, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
    };
    exit();
    navigate('/chat/channel');
  };

  return (
    <div>
      <SetRoom
        isOpenSetRoomModal={isOpenSetRoomModal}
        handleClickModal={handleClickSetRoomModal}
      />
      <Invite
        isOpenInviteModal={isOpenInviteModal}
        handleClickModal={handleClickSetInviteModal}
      />
      {isOpenSideModal && (
        <ModalOutside onClick={() => handleClickModal()}>
          <SideModalDiv onClick={e => e.stopPropagation()}>
            <Header>
              <p># 설정</p>
            </Header>
            <Text onClick={handleClickSetRoomModal}>채팅방 설정</Text>
            <Hr />
            <Text onClick={handleClickSetInviteModal}>초대하기</Text>
            <Hr />
            <Text onClick={handleClickExit}>나가기</Text>
            <Header>
              <p># 대화상대</p>
            </Header>
            <div>
              {userChannels ? (
                userChannels.map(userChannel => {
                  return (
                    <UserListContainer key={userChannel.user.userId}>
                      <UserListWrap>
                        <Wrap>
                          <UserImageWrap>
                            <img
                              src={userChannel.user.image}
                              alt={userChannel.user.image}
                            />
                          </UserImageWrap>
                        </Wrap>
                        <Wrap>
                          <p>{userChannel.user.nickname}</p>
                        </Wrap>
                        <Wrap>
                          <IconWrap onClick={() => handleSetAdmin(userChannel)}>
                            <img src={What} alt={What} />
                          </IconWrap>
                        </Wrap>
                        <Wrap>
                          <IconWrap
                            onClick={() => handleAddFriend(userChannel)}
                          >
                            <img src={Plus} alt={Plus} />
                          </IconWrap>
                        </Wrap>
                      </UserListWrap>
                    </UserListContainer>
                  );
                })
              ) : (
                <Text>Loading...</Text>
              )}
            </div>
          </SideModalDiv>
        </ModalOutside>
      )}
    </div>
  );
}

const ModalOutside = styled.div`
  position: absolute;
  top: 0%;
  left: 50%;
  transform: translate(-50%, 0%);
  width: 100%;
  height: 100%;
  max-width: 412px;
  max-height: 915px;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 100;
`;

const SideModalDiv = styled.div`
  position: fixed;
  top: 0%;
  left: 50%;
  width: 50%;
  height: 100%;
  max-width: 206px;
  max-height: 915px;
  background-color: white;
  overflow-y: auto;
  z-index: 200;
`;

const Header = styled.div`
  background: #313c7a;
  padding: 8px 0;
  > p {
    font-family: 'SEBANG Gothic';
    margin: 0;
    margin-left: 10px;
    color: white;
    font-size: 1.5rem;
    text-align: left;
  }
`;

const Text = styled.p`
  color: #2d3648;
  margin: 0px;
  padding: 10px 0;
  padding-left: 12px;
  text-align: left;
  font-size: 1.5rem;
  cursor: pointer;
`;

const Hr = styled.hr`
  margin: 0;
  color: #c2c2c2;
`;

const UserListContainer = styled.div`
  margin: 0 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const UserListWrap = styled.div`
  padding: 0;
  width: 100%;
  margin-top: 10px;
  margin-bottom: 5px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
`;

const Wrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  > p {
    margin: 0;
    padding: 0;
    font-size: 1.2rem;
    font-weight: bolder;
  }
`;

const UserImageWrap = styled.div`
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const IconWrap = styled.div`
  width: 1.6rem;
  height: 1.6rem;
  overflow: hidden;
  cursor: pointer;

  img {
    width: 100%;
    height: 100%;
  }
`;
