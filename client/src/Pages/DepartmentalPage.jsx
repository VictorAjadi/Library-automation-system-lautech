import React from "react";
import styled from "styled-components";
import { FaUser, FaKey, FaChevronRight } from "react-icons/fa";
import BackButton from "../components/BackButton";
import LinkButton from "../components/LinkButton";

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

const DepartmentalPage = () => {
  return (
    <Container>
      <div className="d-flex gap-5 my-3 justify-content-between align-items-center">
        <BackButton/>
      </div>
      <Description>
        See information about your departmental mate and lecturers.
      </Description>
      <LinkButton to="student" className="rv-txdec" text={
          <Item>
            <IconWrapper>
              <FaUser />
            </IconWrapper>
            <Content>
              <Title>Departmental Mate</Title>
              <Text>See departmental student information like matric number, email, name, image, mobile number and other details.</Text>
            </Content>
            <Arrow>
              <FaChevronRight />
            </Arrow>
          </Item>
      }/>
      <LinkButton to="lecturers" className="rv-txdec" text={
        <Item>
          <IconWrapper>
            <FaKey />
          </IconWrapper>
          <Content>
            <Title>Departmental Lecturers</Title>
            <Text>See departmental lecturers information like email, name, image, mobile number and other details.</Text>
          </Content>
          <Arrow>
            <FaChevronRight />
          </Arrow>
        </Item>
      }/>
    </Container>
  );
};

export default DepartmentalPage;
