import React from 'react';
import styled from '@emotion/styled';

import { LIB_NAME } from '../constants';
import NoData from '../components/NoData';
import Item from '../components/Item';

import { valueExistInSelected, hexToRGBA, isomorphicWindow } from '../util';

const dropdownPosition = (props, methods) => {
  const DropdownBoundingClientRect = methods.getSelectRef().getBoundingClientRect();
  const dropdownHeight =
    DropdownBoundingClientRect.bottom + parseInt(props.dropdownHeight, 10) + parseInt(props.dropdownGap, 10);

  if (props.dropdownPosition !== 'auto') {
    return props.dropdownPosition;
  }

  if (dropdownHeight > isomorphicWindow().innerHeight && dropdownHeight > DropdownBoundingClientRect.top) {
    return 'top';
  }

  return 'bottom';
};

const getBoundingStyle = (parentPosition, dropdownGap) => {
  if (!parentPosition) return '';
  var body = document.body,
    html = document.documentElement;
  const windowAvailableHeight =Math.max( body.scrollHeight, body.offsetHeight,
    html.clientHeight, html.scrollHeight, html.offsetHeight );
  const windowAvailableWidth = Math.max( body.scrollWidth, body.offsetWidth,
    html.clientWidth, html.scrollWidth, html.offsetWidth );
  const minDistanceFromRight = windowAvailableWidth - parentPosition.right;
  const minDistanceFromLeft = parentPosition.left;
  const minDistanceFromTop = parentPosition.top;
  const minDistanceFromBottom = windowAvailableHeight - parentPosition.bottom;
  const height = parentPosition.height;
  const horizontalStyle = minDistanceFromLeft > minDistanceFromRight ? {right: minDistanceFromRight} : {left: minDistanceFromLeft};
  const verticalStyle = minDistanceFromTop > minDistanceFromBottom ? {bottom: minDistanceFromBottom+dropdownGap+height} : {top: minDistanceFromTop+height+dropdownGap};
  return Object.entries({...horizontalStyle, ...verticalStyle}).map(([key,value]) => `${key}: ${value>10?value:10}px`).join("; ")+";"
};

const Dropdown = ({ props, state, methods }) => {
  return<DropDown
    tabIndex="-1"
    aria-expanded="true"
    role="list"
    dropdownPosition={dropdownPosition(props, methods)}
    selectBounds={state.selectBounds}
    portal={props.portal}
    dropdownGap={props.dropdownGap}
    dropdownHeight={props.dropdownHeight}
    boundingStyle={getBoundingStyle(state.selectBounds, props.dropdownGap)}
    className={`${LIB_NAME}-dropdown ${LIB_NAME}-dropdown-position-${dropdownPosition(
      props,
      methods
    )}`}>
    {props.dropdownRenderer ? (
      props.dropdownRenderer({ props, state, methods })
    ) : (
      <React.Fragment>
        {props.create && state.search && !valueExistInSelected(state.search, [...state.values, ...props.options], props) && (
          <AddNew
            className={`${LIB_NAME}-dropdown-add-new`}
            color={props.color}
            onClick={() => methods.createNew(state.search)}>
            {props.createNewLabel.replace('{search}', `"${state.search}"`)}
          </AddNew>
        )}
        {methods.searchResults().length === 0 ? (
          <NoData
            className={`${LIB_NAME}-no-data`}
            state={state}
            props={props}
            methods={methods}
          />
        ) : (
          methods
            .searchResults()
            .map((item, itemIndex) => (
              <Item
                key={item[props.valueField]}
                item={item}
                itemIndex={itemIndex}
                state={state}
                props={props}
                methods={methods}
              />
            ))
        )}
      </React.Fragment>
    )}
  </DropDown>
};

const DropDown = styled.div`
  position: absolute;
  ${({boundingStyle}) => boundingStyle}
  border: 1px solid #ccc;
  padding: 0;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 2px;
  box-shadow: 0 0 10px 0 ${() => hexToRGBA('#000000', 0.2)};
  max-height: ${({ dropdownHeight }) => dropdownHeight};
  overflow: auto;
  z-index: 9;

  :focus {
    outline: none;
  }
}
`;

const AddNew = styled.div`
  color: ${({ color }) => color};
  padding: 5px 10px;

  :hover {
    background: ${({ color }) => color && hexToRGBA(color, 0.1)};
    outline: none;
    cursor: pointer;
  }
`;

export default Dropdown;
