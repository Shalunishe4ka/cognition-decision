REAL FUNCTION sp(n,u,v)
IMPLICIT NONE
INTEGER,INTENT(IN)::n
REAL,INTENT(IN),DIMENSION(1:n)::u,v
INTEGER i,j,k
REAL*8 w(1:2*n-1)
j=n-1
DO i=1,n
 w(j+i)=u(i)*v(i)
ENDDO
k=2*n-1; j=k-1
DO i=n-1,1,-1
 w(i)=w(j)+w(k)
 k=j-1; j=k-1
ENDDO
sp=REAL(w(1))
RETURN
END FUNCTION sp

SUBROUTINE df(n,a,z,d)
IMPLICIT NONE
INTEGER,INTENT(IN)::n
REAL,INTENT(IN)::a(1:n,1:n)
REAL,INTENT(OUT)::z,d
INTEGER i,j
REAL b(1:n,1:n),c,x(1:n),y(1:n),sp
DO i=1,n-1
 DO j=i+1,n
  b(i,j)=(a(i,j)+a(j,i))*0.5
  b(j,i)=b(i,j)
 ENDDO
ENDDO
d=0.0
DO i=1,n
 z=0.0
 DO j=1,i-1
  z=z+ABS(b(i,j))
 ENDDO
 DO j=i+1,n
  z=z+ABS(b(i,j))
 ENDDO
 IF(z.GT.d)d=z
ENDDO
DO i=1,n
 b(i,i)=a(i,i)+d
ENDDO
x=1.0/SQRT(REAL(n))
c=1.0; z=0.0
DO WHILE(ABS(z-c)/(ABS(c)+ABS(z)).GE.1.0E-06)
 c=z
 DO i=1,n
  y(i)=sp(n,b(i,:),x)
 ENDDO
 z=sp(n,y,x)
 x=y/SQRT(sp(n,y,y))
ENDDO
z=z-d
IF(ABS(z).NE.TINY(z))THEN
 d=1.0/z
ELSE
 d=HUGE(d)
ENDIF
WRITE(*,*)'Maximal Eigen Value =',z,'  Maximal Damping-Factor =',d
 OPEN(UNIT=3, FILE="Maximal_Eigen_Value.txt", ACTION="WRITE")
 WRITE(UNIT=3, FMT=*)"MEV =",z,"MD-F =",d
 CLOSE(UNIT=3)
END SUBROUTINE df

SUBROUTINE cd(n,a,b,x)
IMPLICIT NONE
INTEGER,INTENT(IN)::n
REAL,INTENT(IN)::a(1:n,1:n),b(1:n)
REAL,INTENT(INOUT)::x(1:n)
REAL,DIMENSION(1:n)::d,y,z
REAL o,p,q
INTEGER i
REAL sp
x=0.0; z=0.0; p=1.0; d=0.0
q=sp(n,b,b)
o=1.0
DO WHILE(ABS(o).GE.1.0E-06)
 DO i=1,n
  y(i)=b(i)-sp(n,a(i,:),x)
 ENDDO
 o=-sp(n,z,y)/p
 d=d*o+y
 DO i=1,n
  z(i)=sp(n,a(i,:),d)
 ENDDO
 p=sp(n,z,d)
 o=sp(n,y,d)
 IF(ABS(p).GE.1.0.OR.ABS(p).LT.1.0.AND.ABS(o).LT.ABS(p)*HUGE(o))THEN
  o=o/p
  x=x+d*o
 ELSE
  z=0.0; p=1.0; d=0.0
 ENDIF
 o=sp(n,y,y)/q
ENDDO
END SUBROUTINE cd

SUBROUTINE mi(n,m,l,k,a,b,c,q,x)
IMPLICIT NONE
INTEGER,INTENT(IN)::n,m,l,k
REAL,INTENT(IN)::b(1:n,1:n),c(1:n,1:l),q(1:n,1:k)!,a
REAL,INTENT(INOUT)::x(1:n),a
INTEGER i,j,v(0:l),u
REAL h(1:n,1:n),y(0:l),z(1:n),p/1.0/,s,e/1.0E-06/,o,f
REAL,ALLOCATABLE::g(:,:),t(:,:),r(:),d(:,:),w(:)
REAL sp
z=1.0
DO i=1,k
 s=sp(n,q(:,i),z)
 z=z-q(:,i)*s
ENDDO
x=z/SQRT(sp(n,z,z))
a=0.0
o=1.0
DO WHILE(ABS(a-o).GE.1.0E-06*(ABS(a)+ABS(o)))
 o=a
 a=0.0
 DO i=1,n
  z(i)=sp(n,b(i,:),x)
 ENDDO
 DO i=1,k
  s=sp(n,q(:,i),z)
  z=z-q(:,i)*s
 ENDDO
 a=sp(n,z,x)
 x=z/SQRT(sp(n,z,z))
ENDDO
f=a*2.0
WRITE(*,*)'Unconditional Eigen Value =',a
IF(l.GT.0)THEN
 a=1.0E+04
 DO i=0,l
  v(i)=i
 ENDDO
 x=SUM(b,DIM=1)
 DO i=1,k
  s=sp(n,c(:,i),x)/sp(n,c(:,i),q(:,i))
  x=x-q(:,i)*s
 ENDDO
 x=x/SQRT(sp(n,x,x))
 e=1.0
 y=0.0
 h=b
 o=0.0
 DO WHILE(e.GE.o*1.0E-06)
  DO i=1,n
   h(i,i)=b(i,i)+a-y(0)
  ENDDO
  j=m
  DO i=m+1,l
   s=sp(n,c(:,i),x)
   IF(s*p.GE.y(i))THEN
    v(j-i+l+1)=i; y(i)=0.0
   ELSE
    j=j+1; v(j)=i
   ENDIF
  ENDDO
  ALLOCATE(g(1:n,0:j),t(1:n,0:j),r(0:j),d(0:j,0:j),w(0:j))
  g(:,0)=x; g(:,1:j)=c(:,v(1:j))
  DO i=0,j
   CALL cd(n,h,g(:,i),t(:,i))
  ENDDO
  CALL cd(n,h,x*(y(0)-a),z)
  DO i=0,j
   r(i)=sp(n,g(:,i),z)
  ENDDO
  r(0)=r(0)+1.0
  DO i=0,j
   DO u=0,i
    d(i,u)=(sp(n,g(:,i),t(:,u))+sp(n,t(:,i),g(:,u)))*0.5
    d(u,i)=d(i,u)
   ENDDO
  ENDDO
  CALL cd(j+1,d,r,w)
  y(v(0:j))=w
  DO i=1,n
   x(i)=sp(j+1,t(i,:),w)-z(i)
  ENDDO
  DO i=1,k
   s=sp(n,c(:,i),x)/sp(n,c(:,i),q(:,i))
   x=x-q(:,i)*s
  ENDDO
  x=x/SQRT(sp(n,x,x))
  g(:,0)=x
  DO i=1,n
   z(i)=sp(n,b(i,:),x)-sp(j+1,g(i,:),w)
  ENDDO
  DO i=0,j
   r(i)=sp(n,g(:,i),x)
  ENDDO
  r(0)=r(0)-1.0
  e=SQRT(sp(n,z,z)/REAL(n)+sp(j+1,r,r)/REAL(j+1))
  IF(o.EQ.0.0)o=e
  WRITE(*,*)e/o,char(9),a
  DEALLOCATE(w,d,r,t,g)
  IF(a.GE.f)a=a*0.5
 ENDDO
ELSE
 h=-b
 DO i=1,n
  h(i,i)=a-b(i,i)
 ENDDO
 z=1.0
 DO i=1,k
  s=sp(n,q(:,i),z)
  z=z-q(:,i)*s
 ENDDO
 x=z/SQRT(sp(n,z,z))
 e=a
 o=0.0
 DO WHILE(ABS(e-o).GE.1.0E-06*(ABS(e)+ABS(o)))
  o=e
  e=0.0
  DO i=1,n
   z(i)=sp(n,b(i,:),x)
  ENDDO
  e=sp(n,z,x)
  DO i=1,n
   z(i)=sp(n,h(i,:),x)
  ENDDO
  DO i=1,k
   s=sp(n,q(:,i),z)
   z=z-q(:,i)*s
  ENDDO
  x=z/SQRT(sp(n,z,z))
 ENDDO
ENDIF
END SUBROUTINE mi

PROGRAM mi_large_scale
IMPLICIT NONE
INTEGER j,k,l,m,n,p,q, count
REAL d,r,w
INTEGER,ALLOCATABLE::i(:)
REAL,ALLOCATABLE::a(:,:),b(:,:),c(:,:),u(:,:),x(:,:),y(:),z(:,:),g(:,:)
CHARACTER o
REAL sp
OPEN(UNIT=1, FILE='matrica.txt')
READ(UNIT=1,FMT=*)n
READ(UNIT=1,FMT=*)m,k,l
IF(l.GT.0)THEN
 ALLOCATE(i(1:l),c(1:n,1:l))
 READ(UNIT=1,FMT=*)i
ENDIF
ALLOCATE(a(1:n,1:n),b(1:n,1:n),u(1:n,1:n),x(1:n,1:n),y(1:n),z(1:n,1:n-1))
a=0.0
READ(UNIT=1,FMT=*)
j=0
DO WHILE(j.NE.-1)
 READ(UNIT=1,FMT=*,IOSTAT=j)p,q,j,w
 a(q,p)=w
ENDDO
!!WRITE(*,*)p,q,j,w
CLOSE(UNIT=1)
d=0.0
CALL df(n,a,w,r)
DO WHILE(d.LE.0.0.OR.d.GE.r)
 d=0.3
 !!WRITE(*,*)'Damping-Factor:'
 !!READ(*,*)d
ENDDO
a=-a*d
DO j=1,n
 a(j,j)=a(j,j)+1.0
ENDDO
IF(k.GT.0)c(:,1:k)=TRANSPOSE(a(i(1:k),:))
IF(l.GT.k)c(:,k+1:l)=TRANSPOSE(-a(i(k+1:l),:))
DO j=1,n
 DO k=1,j
  b(j,k)=sp(n,a(:,j),a(:,k))
  b(k,j)=b(j,k)
 ENDDO
ENDDO
OPEN(UNIT=2,FILE='report.txt')
CLOSE(UNIT=2)
k=0
count = 0
DO WHILE(k.LT.n)
 IF(k+l.GT.0)THEN
  ALLOCATE(g(1:n,1:k+l))
  IF(k.GT.0)g(:,1:k)=z(:,1:k)
  IF(l.GT.0)g(:,k+1:k+l)=c(:,1:l)
  CALL mi(n,k+m,k+l,k,r,b,g,x,y)
  DEALLOCATE(g)
 ELSE
  CALL mi(n,k+m,k+l,k,r,b,z,x,y)
 ENDIF
 k=k+1
 x(:,k)=y
 DO j=1,n
  u(j,k)=sp(n,a(j,:),y)
 ENDDO
 IF(k.LT.n)THEN
  DO j=1,n
   z(j,k)=sp(n,b(j,:),y)
  ENDDO
 ENDIF
 OPEN(UNIT=2,FILE='report.txt',ACCESS='APPEND')
 WRITE(UNIT=2,FMT=*)k,sp(n,x(:,k),x(:,k))/sp(n,u(:,k),u(:,k))
 WRITE(UNIT=2,FMT='(F10.7,A,F11.8)')(x(j,k),char(9),u(j,k),j=1,n)
 CLOSE(UNIT=2)
 count=count+1
 IF(count.EQ.1)EXIT
ENDDO
DEALLOCATE(z,y,x,u,b,a)
IF(ALLOCATED(c))DEALLOCATE(c,i)
END PROGRAM mi_large_scale
