import React from "react";
import styled from "styled-components";
import { FaUser, FaKey, FaChevronRight } from "react-icons/fa";
import BackButton from "../components/BackButton";
import LinkButton from "../components/LinkButton";
import { useUserData } from "../hooks/store";

const Container = styled.div`
  background-color: inherit;
  color: inherit;
  font-family: Arial, sans-serif;
  padding: 20px 10px;
  max-width: 100%;
  margin: 0 auto;
`;

const Description = styled.p`
  font-size: 14px;
  color: inherit;
`;

const Item = styled.div`
  display: flex;
  align-items: center;
  padding: 15px 10px;
  border-bottom: 1px solid #333;

  &:last-child {
    border-bottom: none;
  }
  &:hover {
    background-color: #333;
    color: #fff;
    border-radius: 5px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const IconWrapper = styled.div`
  font-size: 20px;
  margin-right: 15px;
`;

const Content = styled.div`
  flex-grow: 1;
`;

const Title = styled.h2`
  font-size: 18px;
  margin: 0;
`;

const Text = styled.p`
  font-size: 14px;
  margin: 5px 0 0;
`;

const Arrow = styled.div`
  font-size: 18px;
  color: inherit;
`;

const AccountPage = () => {
  const userData = useUserData(state=>state.state);
  return (
    <Container>
      <div className="d-flex gap-5 my-3 justify-content-between align-items-center">
        <BackButton/>
      </div>
      <Description>
        See information about your account, edit your information and password.
      </Description>
      <LinkButton to="account" className="rv-txdec" text={
          <Item>
            <IconWrapper>
              <FaUser />
            </IconWrapper>
            <Content>
              <Title>Account information</Title>
              <Text>See your account information like your phone number and email address.</Text>
            </Content>
            <Arrow>
              <FaChevronRight />
            </Arrow>
          </Item>
      }/>
      <LinkButton to="account/password" style={{pointerEvents: `${userData?.role === 'student' ?'none':'' }`}} className={`rv-txdec ${userData?.role === 'student' ? 'bg-secondary':''}`} text={
        <Item>
          <IconWrapper>
            <FaKey />
          </IconWrapper>
          <Content>
            <Title>Change your password</Title>
            <Text>Change your password at any time.</Text>
          </Content>
          <Arrow>
            <FaChevronRight />
          </Arrow>
        </Item>
      }/>

{/*       <Item>
        <IconWrapper>
          <FaDownload />
        </IconWrapper>
        <Content>
          <Title>Download an archive of your data</Title>
          <Text>Get insights into the type of information stored for your account.</Text>
        </Content>
        <Arrow>
          <FaChevronRight />
        </Arrow>
      </Item>
      <Item>
        <IconWrapper>
          <FaHeartBroken />
        </IconWrapper>
        <Content>
          <Title>Deactivate your account</Title>
          <Text>Find out how you can deactivate your account.</Text>
        </Content>
        <Arrow>
          <FaChevronRight />
        </Arrow>
      </Item> */}
    </Container>
  );
};

export default AccountPage;
