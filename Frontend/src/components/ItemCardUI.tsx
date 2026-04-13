import React from "react";
import { Card } from "./Card";

interface ItemCards {
    name: string;
    quantity: number | string;
}

const ItemCard: React.FC<ItemCards> = ({ name, quantity }) => {
    // 1. Force the input to be a number (handles strings from DB)
    const numQty = Number(quantity);

    // 2. Define our color mapping for the text
    // We use full Tailwind class names so the compiler finds them
    const getTextColor = (qty: number) => {
        if (qty < 0) return "text-gray-400";   // Grey for invalid
        if (qty === 0) return "text-red-600";  // Bright Red for 0
        if (qty < 5) return "text-yellow-500"; // Yellow for 1-4
        return "text-green-600";               // Green for 5+
    };

    return (
        <Card>
            <div className="flex justify-between items-center border-b pb-2 mb-2">
                {/* Item Name */}
                <div className="text-lg font-bold text-gray-800">
                    {name}
                </div>
            </div>

            {/* 3. THE FIX: Apply the dynamic color directly to this div */}
            <div className={`text-sm font-bold uppercase tracking-wide ${getTextColor(numQty)}`}>
                Quantity: {numQty}
            </div>

            {/* Error handling for negative input */}
            {numQty < 0 && (
                <p className="text-[10px] text-gray-400 italic mt-1">
                    Invalid negative value
                </p>
            )}
        </Card>
    );
};

export default ItemCard;