import React from "react";

const categories = [
  "business",
  "art-design",
  "engineering",
  "science",
  "health",
  "fantasy",
  "history",
  "music",
  "programming",
  "food-cooking",
  "sport",
  "technology",
];

const CategorySelect = () => {
  return (
    <div className="w-100">
      <label htmlFor="categorySelect" style={{ fontWeight: "bold", marginBottom: "8px" }}>
        Select a Category:
      </label>
      <select
        id="categorySelect"
        className="w-100"
        defaultValue={""}
        name="category"
        style={{
          padding: "10px",
          borderRadius: "5px",
          border: "1px solid #ccc",
          fontSize: "16px",
        }}
      >
        <option value="" disabled>
          -- Choose a Category --
        </option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category.replace("-", " & ")}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CategorySelect;
