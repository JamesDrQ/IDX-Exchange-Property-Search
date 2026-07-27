import { fireEvent, render, screen } from "@testing-library/react";
import PropertyFilters from "./PropertyFilters";

test("renders all filter controls", () => {
  render(
    <PropertyFilters
      onSearch={jest.fn()}
      onClear={jest.fn()}
    />
  );

  expect(screen.getByPlaceholderText("City")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("ZIP code")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Minimum price")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Maximum price")).toBeInTheDocument();
  expect(screen.getByLabelText("Beds")).toBeInTheDocument();
  expect(screen.getByLabelText("Baths")).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: /search/i })
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: /clear filters/i })
  ).toBeInTheDocument();
});

test("submits only non-empty filters", () => {
  const mockOnSearch = jest.fn();

  render(
    <PropertyFilters
      onSearch={mockOnSearch}
      onClear={jest.fn()}
    />
  );

  fireEvent.change(screen.getByPlaceholderText("City"), {
    target: { value: "San Diego" },
  });

  fireEvent.change(screen.getByLabelText("Beds"), {
    target: { value: "3" },
  });

  fireEvent.click(
    screen.getByRole("button", { name: /search/i })
  );

  expect(mockOnSearch).toHaveBeenCalledWith({
    city: "San Diego",
    beds: "3",
  });
});

test("clears the form and calls onClear", () => {
  const mockOnClear = jest.fn();

  render(
    <PropertyFilters
      onSearch={jest.fn()}
      onClear={mockOnClear}
    />
  );

  const cityInput = screen.getByPlaceholderText("City");
  const bedsSelect = screen.getByLabelText("Beds");

  fireEvent.change(cityInput, {
    target: { value: "Los Angeles" },
  });

  fireEvent.change(bedsSelect, {
    target: { value: "2" },
  });

  fireEvent.click(
    screen.getByRole("button", { name: /clear filters/i })
  );

  expect(cityInput).toHaveValue("");
  expect(bedsSelect).toHaveValue("");
  expect(mockOnClear).toHaveBeenCalledTimes(1);
});