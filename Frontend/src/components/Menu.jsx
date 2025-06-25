import React from 'react';
import { Menu as MantineMenu } from '@mantine/core';
import PropTypes from 'prop-types';


function Menu({ items, position = 'bottom-end', width = 200, target, trigger = 'click', offset, openDelay, closeDelay}) {
  return (
    <MantineMenu 
      shadow="md" 
      width={width} 
      position={position}
      trigger={trigger}
      openDelay={openDelay}
      closeDelay={closeDelay}
      offset={offset}
      styles={{
        dropdown: {
          backgroundColor: '#fefefe',
          border: 'none',
          borderRadius: '8px',
          boxShadow: '0px 0px 20px 0px rgba(0, 0, 0, 0.06)',
        },
        item: {
          borderRadius: '4px',
          padding: '8px 12px',
          fontFamily: 'Poppins, sans-serif',
          fontSize: '14px',
          fontWeight: 400,
          margin: '2px 0',
          transition: 'background-color 0.2s ease',
          '&:hover': {
            backgroundColor: '#F8F9FA',
          },
        },
        label: {
          fontSize: '12px',
          fontWeight: 500,
          color: '#89939E',
          padding: '8px 12px 4px',
        },
        divider: {
          margin: '4px 0',
          borderColor: '#E3E5FF',
          width: '84%',
          marginLeft: '8%',
        },
      }}
    >
      <MantineMenu.Target>
        {target}
      </MantineMenu.Target>
      
      <MantineMenu.Dropdown>
        {items.map((section, sectionIndex) => (
          <React.Fragment key={`section-${sectionIndex}`}>
            {section.label && (
              <MantineMenu.Label>{section.label}</MantineMenu.Label>
            )}
            
            {section.items.map((item, itemIndex) => (
              <MantineMenu.Item
                key={`item-${sectionIndex}-${itemIndex}`}
                color={item.color}
                leftSection={item.icon}
                onClick={item.onClick}
                disabled={item.disabled}
              >
                {item.label}
              </MantineMenu.Item>
            ))}
            
            {sectionIndex < items.length - 1 && <MantineMenu.Divider />}
          </React.Fragment>
        ))}
      </MantineMenu.Dropdown>
    </MantineMenu>
  );
}

Menu.propTypes = {
  // Array of menu sections, each with optional label and required items array
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      items: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string.isRequired,
          icon: PropTypes.node,
          color: PropTypes.string,
          onClick: PropTypes.func,
          disabled: PropTypes.bool
        })
      ).isRequired
    })
  ).isRequired,
  // Position of the menu (uses Mantine's position options)
  position: PropTypes.string,
  // Width of the menu dropdown
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  // React node that will trigger the menu (button, icon, etc.)
  target: PropTypes.node.isRequired,
  // Menu trigger behavior: 'hover', 'click', or 'click-hover'
  trigger: PropTypes.oneOf(['hover', 'click', 'click-hover']),
  // Delay before opening menu in ms
  openDelay: PropTypes.number,
  // Delay before closing menu in ms
  closeDelay: PropTypes.number,
};

export default Menu;