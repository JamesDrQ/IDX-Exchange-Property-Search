import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import PropertyCard from "./PropertyCard";

const mockProperty = {
  L_DisplayId: "1174572339",
  L_Address: "2003 Lynbrook Avenue",
  L_City: "Hacienda Heights",
  L_State: "CA",
  L_Zip: "91745",
  L_SystemPrice: 950000,
  bedrooms: 5,
  bathrooms: 3,
  sqft: 1812,
  L_Photos: "[]",
};

describe("PropertyCard", () => {
  test("renders property data", () => {
    render(
      <MemoryRouter>
        <PropertyCard property={mockProperty} />
      </MemoryRouter>
    );

    expect(
      screen.getByText("2003 Lynbrook Avenue")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Hacienda Heights, CA")
    ).toBeInTheDocument();

    expect(
      screen.getByText("$950,000")
    ).toBeInTheDocument();

    expect(
      screen.getByText(/5 beds/)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/3 baths/)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/1,812 sqft/)
    ).toBeInTheDocument();

    expect(
      screen.getByText("No photo available")
    ).toBeInTheDocument();
  });

  test("clicking the card navigates to the property detail page", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route
            path="/"
            element={<PropertyCard property={mockProperty} />}
          />

          <Route
            path="/property/:id"
            element={<div>Property Detail Page</div>}
          />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(
      screen.getByRole("link")
    );

    expect(
      screen.getByText("Property Detail Page")
    ).toBeInTheDocument();
  });
});

test("navigates through photos and handles image errors", () => {
  const propertyWithPhotos = {
    ...mockProperty,
    L_Photos: JSON.stringify([
      "photo1.jpg",
      "photo2.jpg",
    ]),
  };

  render(
    <MemoryRouter>
      <PropertyCard property={propertyWithPhotos} />
    </MemoryRouter>
  );

  // Initially displays the first photo.
  let image = screen.getByRole("img");

  expect(image).toHaveAttribute("src", "photo1.jpg");
  expect(screen.getByText("1 / 2")).toBeInTheDocument();

  // Previous from the first photo wraps around to the last photo.
  fireEvent.click(
    screen.getByRole("button", { name: "←" })
  );

  image = screen.getByRole("img");

  expect(image).toHaveAttribute("src", "photo2.jpg");
  expect(screen.getByText("2 / 2")).toBeInTheDocument();

  // Next from the last photo wraps around to the first photo.
  fireEvent.click(
    screen.getByRole("button", { name: "→" })
  );

  image = screen.getByRole("img");

  expect(image).toHaveAttribute("src", "photo1.jpg");
  expect(screen.getByText("1 / 2")).toBeInTheDocument();

  // Normal next navigation.
  fireEvent.click(
    screen.getByRole("button", { name: "→" })
  );

  expect(screen.getByRole("img")).toHaveAttribute(
    "src",
    "photo2.jpg"
  );

  // Normal previous navigation.
  fireEvent.click(
    screen.getByRole("button", { name: "←" })
  );

  expect(screen.getByRole("img")).toHaveAttribute(
    "src",
    "photo1.jpg"
  );

  // A failed image should fall back to the placeholder.
  fireEvent.error(screen.getByRole("img"));

  expect(
    screen.getByText("No photo available")
  ).toBeInTheDocument();
});