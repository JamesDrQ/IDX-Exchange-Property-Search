import { fireEvent, render, screen } from "@testing-library/react";
import Pagination from "./Pagination";

test("does not render when there is only one page", () => {
  render(
    <Pagination
      currentPage={1}
      totalPages={1}
      onPageChange={() => {}}
    />
  );

  expect(
    screen.queryByRole("navigation", {
      name: /property pagination/i,
    })
  ).not.toBeInTheDocument();
});

test("disables Previous on the first page", () => {
  render(
    <Pagination
      currentPage={1}
      totalPages={5}
      onPageChange={() => {}}
    />
  );

  expect(
    screen.getByRole("button", { name: /previous/i })
  ).toBeDisabled();
});

test("disables Next on the last page", () => {
  render(
    <Pagination
      currentPage={5}
      totalPages={5}
      onPageChange={() => {}}
    />
  );

  expect(
    screen.getByRole("button", { name: /next/i })
  ).toBeDisabled();
});

test("calls onPageChange with the next page", () => {
  const onPageChange = jest.fn();

  render(
    <Pagination
      currentPage={2}
      totalPages={5}
      onPageChange={onPageChange}
    />
  );

  fireEvent.click(
    screen.getByRole("button", { name: /next/i })
  );

  expect(onPageChange).toHaveBeenCalledWith(3);
});

test("calls onPageChange with the previous page", () => {
  const onPageChange = jest.fn();

  render(
    <Pagination
      currentPage={3}
      totalPages={5}
      onPageChange={onPageChange}
    />
  );

  fireEvent.click(
    screen.getByRole("button", { name: /previous/i })
  );

  expect(onPageChange).toHaveBeenCalledWith(2);
});

test("calls onPageChange when a page number is clicked", () => {
  const onPageChange = jest.fn();

  render(
    <Pagination
      currentPage={1}
      totalPages={5}
      onPageChange={onPageChange}
    />
  );

  fireEvent.click(
    screen.getByRole("button", { name: "3" })
  );

  expect(onPageChange).toHaveBeenCalledWith(3);
});

test("shows ellipses when the current page is in the middle", () => {
  render(
    <Pagination
      currentPage={50}
      totalPages={100}
      onPageChange={() => {}}
    />
  );

  expect(screen.getAllByText("...")).toHaveLength(2);
});

test("does not duplicate the last page near the end", () => {
  render(
    <Pagination
      currentPage={98}
      totalPages={100}
      onPageChange={() => {}}
    />
  );

  expect(
    screen.getAllByRole("button", { name: "100" })
  ).toHaveLength(1);
});

test("does not show ellipses when there are seven or fewer pages", () => {
  render(
    <Pagination
      currentPage={3}
      totalPages={7}
      onPageChange={() => {}}
    />
  );

  expect(screen.queryByText("...")).not.toBeInTheDocument();
});

test("marks the current page", () => {
  render(
    <Pagination
      currentPage={3}
      totalPages={5}
      onPageChange={() => {}}
    />
  );

  expect(
    screen.getByRole("button", { name: "3" })
  ).toHaveAttribute("aria-current", "page");
});

test("shows one ellipsis near the beginning", () => {
  render(
    <Pagination
      currentPage={2}
      totalPages={100}
      onPageChange={() => {}}
    />
  );

  expect(screen.getAllByText("...")).toHaveLength(1);
});