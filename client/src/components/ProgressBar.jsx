import React from "react";
import styled, { css } from "styled-components";

// Styled Components
const PillWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const PercentageText = styled.span`
  font-weight: bold;
  font-size: 14px;
`;

const CircleWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
`;

const Circle = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 5px solid #e1e8ed;
  clip-path: circle(50%);

  ${(props) =>
    props.progress &&
    css`
      background: conic-gradient(
        ${props.progress >= 80
          ? "green"
          : props.progress >= 60
          ? "yellow"
          : "red"} ${props.progress * 3.6}deg,
        #e1e8ed ${props.progress * 3.6}deg
      );
    `}
`;

const CircleText = styled.div`
  position: absolute;
  font-size: 18px;
  font-weight: bold;
`;

const ProgressBar = ({ type = "pill", progress = 0, style = {}, className = "" }) => {
  if (type === "circle") {
    return (
      <CircleWrapper className={className} style={style}>
        <Circle progress={progress} />
        <CircleText>{progress}%</CircleText>
      </CircleWrapper>
    );
  }

  return (
    <PillWrapper className="w-100">
      <meter min={'0'} max={'100'} className={className} value={progress} low={'30'} high={'60'} optimum={'80'} style={style}></meter>
      <PercentageText>{progress}%</PercentageText>
    </PillWrapper>
  );
};

export default ProgressBar;
