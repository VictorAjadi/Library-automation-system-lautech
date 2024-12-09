import React from "react";
import styled from "styled-components";
import { FaChevronRight } from "react-icons/fa";
import { GiBookshelf } from "react-icons/gi";
import { SiBookstack } from "react-icons/si";
import { TbBooksOff } from "react-icons/tb";
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

const BookPage = () => {
  return (
    <Container>
      <div className="d-flex gap-5 my-3 justify-content-between align-items-center">
        <BackButton/>
      </div>
      <Description>
        Locate books of your choice, search, read, borrow and do not forget to return borrowed books as it comes with fine.
      </Description>
      <LinkButton to="library" className="rv-txdec" text={
          <Item>
            <IconWrapper>
              <GiBookshelf />
            </IconWrapper>
            <Content>
              <Title>All Library Books</Title>
              <Text>Look through to select books of your choice to read.</Text>
            </Content>
            <Arrow>
              <FaChevronRight />
            </Arrow>
          </Item>
      }/>
      <LinkButton to="library/read" className="rv-txdec" text={
          <Item>
            <IconWrapper>
              <SiBookstack />
            </IconWrapper>
            <Content>
              <Title>All Books Read</Title>
              <Text>Click to see books that you have read lately.</Text>
            </Content>
            <Arrow>
              <FaChevronRight />
            </Arrow>
          </Item>
      }/>
     <LinkButton to="library/borrow" className="rv-txdec" text={
          <Item>
            <IconWrapper>
              <TbBooksOff />
            </IconWrapper>
            <Content>
              <Title>All Borrowed Books</Title>
              <Text>Click to see books that you have borrowed lately, to avoid paying fine.</Text>
            </Content>
            <Arrow>
              <FaChevronRight />
            </Arrow>
          </Item>
      }/>
    </Container>
  );
};

export default BookPage;
