import { ChangeDetectorRef, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { BehaviorSubject, combineLatest, distinctUntilChanged, map, Subscription, switchMap, timer } from 'rxjs';
import { MINUTE, SECOND } from '../utilities/date-time';

@Pipe({
  name: 'timeAgo',
  standalone: true,
  pure: false,
})
export class TimeAgoPipe implements PipeTransform, OnDestroy {
  private output = '';
  private input = new BehaviorSubject<Date>(new Date());
  private calculateSub: Subscription;

  public constructor(private cd: ChangeDetectorRef) {
    this.calculateSub = combineLatest([timer(0, 1000), this.input])
      .pipe(
        map(([, since]) => Date.now() - since.getTime()),
        switchMap(delta => this.getDiff(delta)),
        distinctUntilChanged(),
      )
      .subscribe(text => {
        this.cd.markForCheck();
        this.output = text;
      });
  }

  public transform(date: Date): string {
    if (!date) {
      return '';
    }

    if (this.input.getValue() !== date) {
      this.input.next(date);
    }

    return this.output;
  }

  public ngOnDestroy() {
    this.calculateSub.unsubscribe();
  }

  private getNegativeDiff(delta: number): string {
    if (delta < MINUTE) {
      return Math.floor(delta / SECOND).toString();
    }

    return ' ';
  }

  private getDiff(delta: number): string {
    if (isNaN(delta)) {
      return ' ';
    }

    if (delta < 0) {
      return this.getNegativeDiff(-delta);
    }

    if (delta < MINUTE) {
      return Math.floor(delta / SECOND).toString();
    }

    return ' ';
  }
}
