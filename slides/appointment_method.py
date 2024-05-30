from typing import Dict, List
import numpy as np
from numpy.typing import ArrayLike


def d_hondt(votes: ArrayLike, seats: int):
    assigned_seats = np.zeros_like(votes)
    while sum(assigned_seats) < seats:
        scores = votes / (assigned_seats + 1)
        to_increment = np.argmax(scores)
        assigned_seats[to_increment] += 1
    return assigned_seats


def sainte_laguë(votes: ArrayLike, seats: int):
    assigned_seats = np.zeros_like(votes)
    while sum(assigned_seats) < seats:
        scores = votes / (2 * assigned_seats + 1)
        to_increment = np.argmax(scores)
        assigned_seats[to_increment] += 1
    return assigned_seats


def hare_nimeyer(votes: ArrayLike, seats: int):
    assigned_seats = np.floor((votes * seats) / sum(votes))
    rest = (votes * seats) / sum(votes) - assigned_seats
    while sum(assigned_seats) < seats:
        to_increment = np.argmax(rest)
        rest[to_increment] = 0
        assigned_seats[to_increment] += 1
    return assigned_seats
