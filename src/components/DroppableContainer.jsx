import React from 'react';
import { useDroppable } from '@dnd-kit/core';

function DroppableContainer({ id, children, className }) {
    const { setNodeRef, isOver } = useDroppable({ id });
    const containerStyle = {
        minHeight: '100px',
        borderRadius: '8px',
        padding: '16px',
        margin: '8px',
        transition: 'all 0.2s ease-in-out',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    };

    return (
        <div ref={setNodeRef} style={containerStyle} className={className}>
            {children}
        </div>
    );
}

export default DroppableContainer;