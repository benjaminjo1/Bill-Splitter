import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

function DraggableItem({ id, children }) {
    const { attributes, listeners, setNodeRef, transform, isDragging} = useDraggable({ id });
    
    const dragStyle = transform ? {
        transform: CSS.Translate.toString(transform),
    } : {};

    const transitionStyle = isDragging ? 'none' : 'transform 0.3s ease, box-shadow 0.3s ease';

    const itemstyle = {
        cursor: 'grab',
        touchAction: 'none',
        display: 'inline-block',
        transition: transitionStyle,
        ...dragStyle
    };

    return (
        <div ref={setNodeRef} style={itemstyle} {...listeners} {...attributes} className='item-container'>
            {children}
        </div>
    );
}

export default DraggableItem;