import React from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: column;
  width: 100%;
`;

const Div = styled.div`
  padding: 10px;
  text-align: center;
`;

const FirstDiv = styled(Div)`
  width: 100%;
  flex: 0 1 auto; /* This will allow it to maintain its natural width */
`;

const MiddleDiv = styled(Div)`
    width: 100%;
  flex-grow: 1; /* This will make it fill the available space */
`;

const LastDiv = styled(Div)`
  flex: 0 1 auto; /* This will allow it to maintain its natural width */
`;

const ThreeColumnLayout = ({FirstDivComp,MiddleDivComp,LastDivComp}) => {
  return (
    <Container>
      <FirstDiv>{FirstDivComp}</FirstDiv>
      <MiddleDiv>{MiddleDivComp}</MiddleDiv>
      <LastDiv>{LastDivComp}</LastDiv>
    </Container>
  );
};

export default React.memo(ThreeColumnLayout);