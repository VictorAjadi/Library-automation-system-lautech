import React from "react";
import styled from "styled-components";
import { FaCheckCircle, FaRegCalendarCheck, FaChevronRight } from "react-icons/fa";
import BackButton from "../components/BackButton";
import LinkButton from "../components/LinkButton";
import { useUserData } from "../hooks/store";
import { FaCalendarCheck } from "react-icons/fa6";
import { GoBookmarkSlashFill } from "react-icons/go";

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

const ScannerPage = () => {
  return (
    <Container>
      <div className="d-flex gap-5 my-3 justify-content-between align-items-center">
        <BackButton/>
      </div>
      <Description>
        This is available only to admins/sub-admins, to return borrowed books, verify a user account, check in and out a user via scanning.
      </Description>
      <LinkButton to="verify" className="rv-txdec" text={
          <Item>
            <IconWrapper>
              <FaCheckCircle />
            </IconWrapper>
            <Content>
              <Title>Scan to verify Account</Title>
              <Text>Scan both staff and students account to give them access to read and borrow books.</Text>
            </Content>
            <Arrow>
              <FaChevronRight />
            </Arrow>
          </Item>
      }/>
      <LinkButton to="check-in" className={`rv-txdec`} text={
        <Item>
          <IconWrapper>
           <FaCalendarCheck />
          </IconWrapper>
          <Content>
            <Title>Scan to check in Account</Title>
            <Text>Scan here to check in an account for daily access to books.</Text>
          </Content>
          <Arrow>
            <FaChevronRight />
          </Arrow>
        </Item>
      }/>

    <LinkButton to="check-out" className={`rv-txdec`} text={
        <Item>
          <IconWrapper>
            <FaRegCalendarCheck />
          </IconWrapper>
          <Content>
            <Title>Scan to check out Account</Title>
            <Text>Scan here to check out an account for daily user check out tracking.</Text>
          </Content>
          <Arrow>
            <FaChevronRight />
          </Arrow>
        </Item>
      }/>
      <LinkButton to="return" className={`rv-txdec`} text={
        <Item>
          <IconWrapper>
             <GoBookmarkSlashFill />
          </IconWrapper>
          <Content>
            <Title>Scan to return borrowed books</Title>
            <Text>Scan here to return books borrowed by users.</Text>
          </Content>
          <Arrow>
            <FaChevronRight />
          </Arrow>
        </Item>
      }/>

    </Container>
  );
};

export default ScannerPage;
