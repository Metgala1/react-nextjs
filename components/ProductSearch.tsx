
"use client";

import { useState } from "react";

export default function ProductSearch() {
  const [search, setSearch] = useState("");

  return (
    <div>
      <label htmlFor="product-search">
        Search products
      </label>

      <input
        id="product-search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search products..."
      />

      {search.trim() ? (
        <p>Searching for: {search}</p>
      ) : (
        <p>Enter a product name to get started.</p>
      )}
    </div>
  );
}
