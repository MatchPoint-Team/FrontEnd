import { Socket } from 'socket.io-client';
import styled from 'styled-components';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NoXPopup } from '../../../../commons/modals/popup-modal/Popup';

interface Props {
  handleClickModal: () => void;
  socketRef: React.RefObject<Socket> | null;
}

export default function AcceptWaiting({ handleClickModal, socketRef }: Props) {
  const navigate = useNavigate();

  useEffect(() => {
    // 초대 보낸 사람이 게임 초대 수락해서 게임 페이지로 이동함
    socketRef?.current?.once('goGameReadyPage', () => {
      console.log('방장인 유저가 게임 페이지로 이동');
      handleClickModal();
    });

    // 초대 보낸 사람이 게임 초대 거절 당함
    socketRef?.current?.once('inviteReject', () => {
      console.log('초대 거부됨');
      handleClickModal();
    });

    return () => {
      socketRef?.current?.off('goGameReadyPage');
      socketRef?.current?.off('inviteReject');
    };
  });

  return (
    <NoXPopup onClose={handleClickModal}>
      <MainText>초대 수락 대기 중...</MainText>
      <CancelButton onClick={() => handleClickModal()}>취소</CancelButton>
    </NoXPopup>
  );
}

const MainText = styled.p`
  padding-top: 1rem;
  margin: 20px 0;
  color: #3f4d97;
  font-size: 2rem;
  font-weight: bold;
`;

const CancelButton = styled.button`
  font-family: 'NanumGothic';
  font-weight: 700;
  font-size: 1.2rem;
  align-self: center;
  width: 10rem;
  color: white;
  background: #313c7a;
  border-radius: 20px;
  border: none;
  margin-bottom: 10px;
  padding: 7px;
  cursor: pointer;
`;