//double security for assuring that the user doesnt try to enter a quantity thats invalid
//also assuring that a user cannot add an item without a name

import React, { useState } from "react";

//define props type for the form
type AddItemFormProps = {
    addItem: (item: { name: string; quantity: number }) => void;
};

//form component to add new inventory items
const AddItemForm: React.FC<AddItemFormProps> = ({ addItem }) => {

    //state to store item name input
    const [name, setName] = useState("");

    //state to store item quantity input
    const [quantity, setQuantity] = useState(0);

    // when user clicks "Add Item"
    const handleSubmit = () => {

        //making sure user doesnt try to enter name as empty or just spaces
        if (!name.trim()) {
            alert("Name is required");
            return;
        }

        //making sure user cannot input negative quantities
        if (quantity < 0) {
            alert("Quantity cannot be negative");
            return;
        }

        //send valid item to parent component
        addItem({ name, quantity });
    };

    return (
        <div>

            {/* input for item name */}
            <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
            />

            {/* input for item quant */}
            <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                placeholder="Quantity"
            />

            {/* submit button */}
            <button onClick={handleSubmit}>
                Add Item
            </button>

        </div>
    );
};

export default AddItemForm;